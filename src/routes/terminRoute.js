import express from 'express';
import { getVerfuegbareTermine } from '../controllers/terminController.js';

export const router = express.Router();

router.get('/', getVerfuegbareTermine);