import express from 'express';
import syncController from '../controllers/sync.controller.js';
import downloadController from '../controllers/download.controller.js';

const router = express.Router();

router.post('/sync/', syncController.startSyncJob);
router.post('/download/:id', downloadController.enqueueDownload);

export default router;
