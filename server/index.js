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
const { authenticateToken, requireRole } = require('./middleware/auth');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

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

// Submit Outpass Request
app.post('/api/outpass', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  const { destination, reason, departureDate, returnDate } = req.body;

  if (!destination || !reason || !departureDate || !returnDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const outpass = await prisma.outpass.create({
      data: {
        // req.user.userId is securely pulled from your JWT token middleware
        studentId: req.user.userId, 
        destination,
        reason,
        // Prisma requires standard ISO Date objects
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate),
      },
    });
    
    res.status(201).json({ message: 'Outpass requested successfully', outpass });
  } catch (error) {
    console.error('Error creating outpass:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Admin - Bulk Upload
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

// Admin - Get Students
app.get('/api/students', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, orderBy: { createdAt: 'desc' } });
    res.json(students);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch students.', error: error.message }); }
});

// Student - Submit Outpass
app.post('/api/outpasses', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  const { destination, reason, departureDate, returnDate } = req.body;
  try {
    const outpass = await prisma.outpass.create({
      data: { studentId: req.user.userId, destination, reason, departureDate: new Date(departureDate), returnDate: new Date(returnDate), status: 'PENDING' }
    });
    res.json({ message: 'Application submitted successfully!', outpass });
  } catch (error) { res.status(500).json({ message: 'Failed to submit application.', error: error.message }); }
});

// Student - Get My Outpasses
app.get('/api/outpasses/me', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  try {
    const outpasses = await prisma.outpass.findMany({ where: { studentId: req.user.userId }, orderBy: { createdAt: 'desc' } });
    res.json(outpasses);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch history.', error: error.message }); }
});

// --- ADMIN OUTPASS ROUTES ---

// Admin - Get All Outpasses (THIS IS THE ROUTE THAT WAS MISSING/FAILING)
app.get('/api/outpasses/all', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const outpasses = await prisma.outpass.findMany({
      include: { student: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(outpasses);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch applications.', error: error.message }); }
});

// Admin - Update Outpass Status
app.put('/api/outpasses/:id/status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { status } = req.body;
  try {
    const outpass = await prisma.outpass.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ message: `Pass ${status.toLowerCase()} successfully.`, outpass });
  } catch (error) { res.status(500).json({ message: 'Failed to update status.', error: error.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server securely initialized. Listening on port ${PORT}`));