require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorMiddleware, sendError } = require('./utils/errorHandler');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const subjectRoutes = require('./routes/subject.routes');
const testRoutes = require('./routes/test.routes');
const markRoutes = require('./routes/mark.routes');

const app = express();

// Connect to MongoDB (only if a URI is configured; server can still boot for local checks)
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('MONGODB_URI not set. Skipping database connection.');
}

// Middleware
app.use(
  cors({
    origin: 'https://taupe-dieffenbachia-9a582e.netlify.app/login',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MarkTrack API is running',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/marks', markRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
  return sendError(res, 404, 'Route not found.');
});

// Central error handler (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MarkTrack API server running on port ${PORT}`);
});

module.exports = app;
