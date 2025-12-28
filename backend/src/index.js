require('dotenv').config();
const express = require('express');
const cors = require('cors');
const linkRoutes = require('./routes/links');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/links', linkRoutes);

// Redirect short links
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await db.query(
      'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE short_code = $1 RETURNING original_url',
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.redirect(result.rows[0].original_url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize database and start server
db.initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`DomisLink API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
