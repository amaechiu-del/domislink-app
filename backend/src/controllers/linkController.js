const db = require('../config/database');
const { nanoid } = require('nanoid');

const getAllLinks = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
};

const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM links WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
};

const createLink = async (req, res) => {
  try {
    const { original_url, title, custom_code } = req.body;

    if (!original_url) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    try {
      new URL(original_url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = custom_code || nanoid(7);

    // Check if custom code already exists
    if (custom_code) {
      const existing = await db.query(
        'SELECT id FROM links WHERE short_code = $1',
        [custom_code]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Custom code already in use' });
      }
    }

    const result = await db.query(
      'INSERT INTO links (original_url, short_code, title) VALUES ($1, $2, $3) RETURNING *',
      [original_url, shortCode, title || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
};

const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, original_url } = req.body;

    const result = await db.query(
      'UPDATE links SET title = COALESCE($1, title), original_url = COALESCE($2, original_url) WHERE id = $3 RETURNING *',
      [title, original_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM links WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
};

const getLinkStats = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, short_code, clicks, created_at, last_clicked FROM links WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getAllLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  getLinkStats
};
