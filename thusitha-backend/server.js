require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes'); 
const reportRoutes = require('./routes/reportRoutes');
const parentRoutes = require('./routes/parentRoutes');
const studyAreaRoutes = require('./routes/studyAreaRoutes');
const examRoutes = require('./routes/examRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const hallRoutes = require('./routes/hallRoutes'); // New
const classScheduleRoutes = require('./routes/classScheduleRoutes'); // New
const cameraZoneRoutes = require('./routes/cameraZoneRoutes'); // New
const promoRoutes = require('./routes/promoRoutes'); // For Dynamic Flyers
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes'); // New
const auditRoutes = require('./routes/auditRoutes');
const whatsappService = require('./utils/whatsappService'); // Import whatsappService
const { initCronJobs } = require('./utils/cronJobs');
const materialRoutes = require('./routes/materialRoutes');
const moodleSsoRoutes = require('./routes/moodleSsoRoutes');
const announcementRoutes = require('./routes/announcementRoutes'); // New
const achievementRoutes = require('./routes/achievementRoutes'); // New

const app = express();
app.disable('x-powered-by');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// static middleware to serve uploaded files (PDFs, Images)
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Welcome to the Thusitha Institute Smart Class Management System API');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/study-area', studyAreaRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/halls', hallRoutes); // New
app.use('/api/classes', classScheduleRoutes); // New
app.use('/api/camera-zones', cameraZoneRoutes); // New
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes); // New
app.use('/api/audit', auditRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/moodle-sso', moodleSsoRoutes);
app.use('/api/announcements', announcementRoutes); // New
app.use('/api/achievements', achievementRoutes); // New

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack);
  res.status(500).json({
    status: 'Error',
    message: 'An internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Start automated tasks
initCronJobs(); // 💡 Automated tasks enabled

module.exports = server;
