const express = require('express');
const { getDb, saveDb } = require('../db');
const protect = require('../middleware/protect');

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Convert sql.js query results (array of {columns, values}) to plain objects.
 */
function toObjects(results) {
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

// All routes below are protected — user_id always comes from verified JWT (req.user.user_id)

/**
 * GET /api/capsules
 * Returns all capsule records belonging to the authenticated user.
 */
router.get('/api/capsules', protect, async (req, res) => {
  try {
    const db = await getDb();
    const results = db.exec(
      'SELECT * FROM capsules WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.user_id]
    );
    res.json(toObjects(results));
  } catch (err) {
    console.error('GET /api/capsules error:', err);
    res.status(500).json({ error: 'Failed to fetch capsules.' });
  }
});

/**
 * POST /api/capsules
 * Creates a new capsule record for the authenticated user.
 * user_id is taken from the JWT, NOT from the request body.
 */
router.post('/api/capsules', protect, async (req, res) => {
  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness, reviewed, improved,
    screenshot_url, notes,
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'project_name, prompt_title, and prompt_text are required.' });
  }

  try {
    const db = await getDb();

    db.run(
      `INSERT INTO capsules
        (user_id, project_name, prompt_title, prompt_version, prompt_text,
         response_summary, category, usefulness, reviewed, improved,
         screenshot_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        project_name,
        prompt_title,
        prompt_version || null,
        prompt_text,
        response_summary || null,
        category || null,
        usefulness || null,
        reviewed ? 1 : 0,
        improved ? 1 : 0,
        screenshot_url || null,
        notes || null,
      ]
    );

    saveDb(db);

    // Fetch the newly inserted record
    const newId = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
    const newRow = toObjects(db.exec('SELECT * FROM capsules WHERE id = ?', [newId]));

    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error('POST /api/capsules error:', err);
    res.status(500).json({ error: 'Failed to create capsule.' });
  }
});

/**
 * PUT /api/capsules/:id
 * Updates an existing capsule record.
 * Ownership is enforced: WHERE clause includes BOTH id AND user_id from JWT.
 */
router.put('/api/capsules/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();

    // Verify ownership
    const existing = toObjects(
      db.exec('SELECT * FROM capsules WHERE id = ? AND user_id = ?', [id, req.user.user_id])
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Capsule not found or access denied.' });
    }
    const cap = existing[0];

    const {
      project_name, prompt_title, prompt_version, prompt_text,
      response_summary, category, usefulness, reviewed, improved,
      screenshot_url, notes,
    } = req.body;

    db.run(
      `UPDATE capsules SET
        project_name = ?, prompt_title = ?, prompt_version = ?,
        prompt_text = ?, response_summary = ?, category = ?,
        usefulness = ?, reviewed = ?, improved = ?,
        screenshot_url = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        project_name    ?? cap.project_name,
        prompt_title    ?? cap.prompt_title,
        prompt_version  ?? cap.prompt_version,
        prompt_text     ?? cap.prompt_text,
        response_summary ?? cap.response_summary,
        category        ?? cap.category,
        usefulness      ?? cap.usefulness,
        reviewed !== undefined ? (reviewed ? 1 : 0) : cap.reviewed,
        improved  !== undefined ? (improved  ? 1 : 0) : cap.improved,
        screenshot_url  ?? cap.screenshot_url,
        notes           ?? cap.notes,
        Number(id),
        req.user.user_id,
      ]
    );

    saveDb(db);

    const updated = toObjects(db.exec('SELECT * FROM capsules WHERE id = ?', [id]));
    res.json(updated[0]);
  } catch (err) {
    console.error('PUT /api/capsules/:id error:', err);
    res.status(500).json({ error: 'Failed to update capsule.' });
  }
});

/**
 * DELETE /api/capsules/:id
 * Deletes a capsule record.
 * Ownership enforced via WHERE id = ? AND user_id = ?.
 */
router.delete('/api/capsules/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();

    // Verify ownership before deleting
    const existing = toObjects(
      db.exec('SELECT id FROM capsules WHERE id = ? AND user_id = ?', [id, req.user.user_id])
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Capsule not found or access denied.' });
    }

    db.run('DELETE FROM capsules WHERE id = ? AND user_id = ?', [id, req.user.user_id]);
    saveDb(db);

    res.json({ message: 'Capsule deleted successfully.' });
  } catch (err) {
    console.error('DELETE /api/capsules/:id error:', err);
    res.status(500).json({ error: 'Failed to delete capsule.' });
  }
});

module.exports = router;
