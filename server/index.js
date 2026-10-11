const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const twilio = require('twilio'); // NEW: Twilio imported
const { authenticateToken, requireRole } = require('./middleware/auth');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// NEW: Initialize Twilio Client using your Environment Variables
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://mentor-outpass-system-v2.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/api/health', async (req, res) => res.json({ status: 'success' }));

// Secure Login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields.' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || user.role !== role) return res.status(401).json({ message: 'Invalid credentials or role.' });
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Internal server error.' }); }
});

// ==========================================
// OUTPASS ROUTES (Twilio Integration added)
// ==========================================

app.post('/api/outpasses', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  const { 
    leaveCategory, destination, reason, 
    departureDate, departureTime, 
    returnDate, returnTime, 
    parentType, parentPhone 
  } = req.body;

  if (!destination || !reason || !departureDate || !returnDate || !parentPhone) {
    return res.status(400).json({ message: 'Missing required fields including Parent Phone.' });
  }

  try {
    const outpass = await prisma.outpass.create({
      data: {
        studentId: req.user.userId, 
        leaveCategory: leaveCategory || 'SHORT_LEAVE',
        destination,
        reason,
        departureDate: new Date(departureDate),
        departureTime, 
        returnDate: new Date(returnDate),
        returnTime,    
        status: 'PENDING',
        parentStatus: 'PENDING', 
        mentorStatus: 'PENDING',
        wardenStatus: 'PENDING'
      },
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { parentPhone }
    });
    
    // NEW: Trigger the automated WhatsApp Message
    try {
      const formattedPhone = parentPhone.startsWith('+') ? parentPhone : `+91${parentPhone}`;
      
      const msgText = `*MENTOR HOSTEL SYSTEM*\n\nDear ${parentType || 'Parent'},\nYour ward has requested an out-pass.\n\n*Destination:* ${destination}\n*Reason:* ${reason}\n*Leaves:* ${new Date(departureDate).toLocaleDateString()} at ${departureTime}\n*Returns:* ${new Date(returnDate).toLocaleDateString()} at ${returnTime}\n\n*Reply with:*\nAPPROVE ${outpass.id}\nREJECT ${outpass.id}`;
      
      await twilioClient.messages.create({
        body: msgText,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedPhone}`
      });
      console.log('WhatsApp message sent for outpass:', outpass.id);
    } catch (twilioError) {
      console.error('Failed to send Twilio message:', twilioError);
    }
    
    res.status(201).json({ message: 'Outpass requested successfully', outpass });
  } catch (error) {
    console.error('Error creating outpass:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/outpasses/me', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  try {
    const outpasses = await prisma.outpass.findMany({
      where: { studentId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(outpasses);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/outpasses/all', authenticateToken, requireRole(['WARDEN', 'MENTOR', 'ADMIN']), async (req, res) => {
  try {
    const outpasses = await prisma.outpass.findMany({
      include: { student: { select: { email: true, parentPhone: true } } },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(outpasses);
  } catch (error) {
    console.error('Error fetching all outpasses:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.put('/api/outpasses/:id/status', authenticateToken, requireRole(['WARDEN', 'MENTOR', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const updatedOutpass = await prisma.outpass.update({
      where: { id },
      data: { status, wardenStatus: status },
    });
    res.json({ message: `Outpass ${status.toLowerCase()} successfully`, outpass: updatedOutpass });
  } catch (error) {
    console.error('Error updating outpass status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT & GRIEVANCES
// ==========================================

app.post('/api/students/upload', authenticateToken, requireRole(['ADMIN']), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const results = [];
  fs.createReadStream(req.file.path).pipe(csv()).on('data', (data) => results.push(data)).on('end', async () => {
    try {
      let addedCount = 0;
      const defaultPassword = await bcrypt.hash('Student123!', 10);
      for (const row of results) {
        if (row.email) {
          await prisma.user.upsert({
            where: { email: row.email.trim() },
            update: {}, create: { email: row.email.trim(), passwordHash: defaultPassword, role: 'STUDENT', isActive: true }
          });
          addedCount++;
        }
      }
      fs.unlinkSync(req.file.path);
      res.json({ message: `Successfully imported ${addedCount} student accounts.` });
    } catch (error) { fs.unlinkSync(req.file.path); res.status(500).json({ message: 'Database error.', error: error.message }); }
  });
});

app.get('/api/students', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, orderBy: { createdAt: 'desc' } });
    res.json(students);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch students.', error: error.message }); }
});

app.post('/api/grievances', authenticateToken, async (req, res) => {
  const { category, message } = req.body;
  try {
    const grievance = await prisma.grievance.create({
      data: { category, message },
    });
    res.json({ message: 'Grievance submitted anonymously!', grievance });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({ error: 'Failed to submit grievance' });
  }
});

app.get('/api/grievances', authenticateToken, async (req, res) => {
  try {
    const grievances = await prisma.grievance.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(grievances);
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ error: 'Failed to fetch grievances' });
  }
});

app.put('/api/grievances/:id/reply', authenticateToken, requireRole(['WARDEN', 'ADMIN', 'MENTOR']), async (req, res) => {
  const { id } = req.params;
  const { reply, status } = req.body;
  
  try {
    const updatedGrievance = await prisma.grievance.update({
      where: { id },
      data: { reply, status },
    });
    res.json({ message: 'Reply posted successfully', grievance: updatedGrievance });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({ error: 'Failed to update grievance' });
  }
});

app.post('/api/setup-warden', async (req, res) => {
  try {
    const exists = await prisma.user.findUnique({ where: { email: 'warden@mentor.com' } });
    if (exists) return res.json({ message: 'Warden already exists!' });

    const hashedPassword = await bcrypt.hash('Warden123!', 10);
    await prisma.user.create({
      data: { email: 'warden@mentor.com', passwordHash: hashedPassword, role: 'WARDEN' }
    });
    res.json({ message: 'Warden account created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create warden' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server securely initialized. Listening on port ${PORT}`));