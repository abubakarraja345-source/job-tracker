const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getNotesForJob, createNote, deleteNote } = require('../controllers/notesController');

router.use(authenticate);
router.get('/job/:jobId', getNotesForJob);
router.post('/', createNote);
router.delete('/:id', deleteNote);

module.exports = router;
