const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// Get all links
router.get('/', linkController.getAllLinks);

// Get single link by ID
router.get('/:id', linkController.getLinkById);

// Create new short link
router.post('/', linkController.createLink);

// Update link
router.put('/:id', linkController.updateLink);

// Delete link
router.delete('/:id', linkController.deleteLink);

// Get link statistics
router.get('/:id/stats', linkController.getLinkStats);

module.exports = router;
