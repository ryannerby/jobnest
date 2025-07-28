// server/routes/jobs.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new job
router.post('/', async (req, res) => {
  const { company, title, status, application_date, deadline, notes, link } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jobs (company, title, status, application_date, deadline, notes, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) a job by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { company, title, status, application_date, deadline, notes, link } = req.body;
  try {
    const result = await pool.query(
      `UPDATE jobs SET
         company = $1,
         title = $2,
         status = $3,
         application_date = $4,
         deadline = $5,
         notes = $6,
         link = $7
       WHERE id = $8
       RETURNING *`,
      [company, title, status, application_date, deadline, notes, link, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a job by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
