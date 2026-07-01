const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getAllJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobsController');

router.use(authenticate);
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
