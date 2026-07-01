const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getAllReminders, createReminder, updateReminder, deleteReminder
} = require('../controllers/remindersController');

router.use(authenticate);
router.get('/', getAllReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
