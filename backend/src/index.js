require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contentRoutes = require('./routes/content');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CMS Routes
app.use('/api/content', contentRoutes);

// Initialize database and start server
async function start() {
  try {
    await db.initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`DomisLink CMS backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
