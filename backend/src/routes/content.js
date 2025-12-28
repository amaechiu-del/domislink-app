const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Get all content items
router.get('/', async (req, res) => {
  try {
    const { status, content_type } = req.query;
    let query = 'SELECT * FROM content';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (content_type) {
      params.push(content_type);
      conditions.push(`content_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY updated_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM content WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query('SELECT * FROM content WHERE slug = $1', [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const { slug, title, body, status, content_type, metadata } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO content (id, slug, title, body, status, content_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, slug, title, body || '', status || 'draft', content_type || 'page', metadata || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating content:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Content with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, body, status, content_type, metadata } = req.body;

    const result = await db.query(
      `UPDATE content
       SET slug = COALESCE($2, slug),
           title = COALESCE($3, title),
           body = COALESCE($4, body),
           status = COALESCE($5, status),
           content_type = COALESCE($6, content_type),
           metadata = COALESCE($7, metadata),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, slug, title, body, status, content_type, metadata]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating content:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Content with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;
