import express from 'express';
import VodController from '../controllers/vod.controller.js';

const router = express.Router();

router.get('/', VodController.getVods);
router.get('/:id', VodController.getVodById);
router.delete('/:id', VodController.deleteVod);

export default router;
