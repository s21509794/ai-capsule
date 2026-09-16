const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Public endpoint. Returns { "status": "ok" }.
 * Used by Render and markers to verify the backend is running.
 */
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
