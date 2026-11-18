import { getFreieTermine } from '../services/terminService.js';
import { findPassendeMitarbeiter } from '../repositories/terminRepository.js';

// Controller für die Mitarbeiter-Auswahl
export async function getMitarbeiterFuerLeistung(req, res) {
  try {
    const { leistungId } = req.query;

    if (!leistungId) {
      return res.status(400).json({ error: 'Bitte leistungId angeben.' });
    }

    const mitarbeiter = await findPassendeMitarbeiter(leistungId);
    res.json(mitarbeiter);
  } catch (error) {
    console.error('Fehler beim Laden der Mitarbeiter:', error);
    res.status(500).json({ error: 'Serverfehler: ' + error.message });
  }
}

// Freie Termine (Tage & Uhrzeiten) für Leistung und Mitarbeiter
export async function getVerfuegbareTermine(req, res) {
  try {
    const { leistungId, mitarbeiterId } = req.query;

    if (!leistungId) {
      return res.status(400).json({ error: 'Bitte leistungId angeben.' });
    }

    const verfuegbarkeit = await getFreieTermine(leistungId, mitarbeiterId);
    res.json(verfuegbarkeit);
  } catch (error) {
    console.error('Fehler beim Laden der freien Termine:', error);
    res.status(500).json({ error: 'Serverfehler beim Berechnen der Termine: ' + error.message });
  }
}
