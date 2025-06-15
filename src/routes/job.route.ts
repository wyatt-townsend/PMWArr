import express from 'express';
import jobController from '../controllers/job.controller.js';

const router = express.Router();

router.post('/sync/', jobController.startSyncJob);
router.post('/download/:id', jobController.enqueueDownload);

export default router;
