import express from 'express';
import { rentFilm } from '../controllers/rentalsController.js';

const router = express.Router();


router.post('/', rentFilm);

export default router;
