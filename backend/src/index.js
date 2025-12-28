const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const linksRouter = require('./routes/links');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/links', linksRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'DomisLink API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      links: '/api/links'
    }
  });
});

app.use(errorHandler);

async function start() {
  try {
    if (process.env.DATABASE_URL) {
      await initDatabase();
    } else {
      console.log('No DATABASE_URL configured, skipping database initialization');
    }

    app.listen(PORT, () => {
      console.log(`DomisLink API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
