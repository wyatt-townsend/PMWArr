import express from 'express';
import jobController from '../controllers/sync.controller.js';

const router = express.Router();

router.get('/', jobController.startSyncJob);

export default router;
