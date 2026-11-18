import express from 'express';
import {
  getVerfuegbareTermine,
  getMitarbeiterFuerLeistung
} from '../controllers/terminController.js';

export const router = express.Router();

router.get('/', getVerfuegbareTermine);
router.get('/mitarbeiter', getMitarbeiterFuerLeistung);
