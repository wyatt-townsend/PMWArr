import express from 'express';
import settingsController from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);

export default router;
