import express from 'express';
import { getMitarbeiterRaw } from '../controllers/mitarbeiterTestController.js';


export const router = new express.Router();

router.get('/', getMitarbeiterRaw);

