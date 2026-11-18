import { getFreieTermine } from '../services/terminService.js';

export async function getVerfuegbareTermine(req, res) {
  try {
    const { leistungId } = req.query;

    if (!leistungId) {
      return res.status(400).json({ error: 'Bitte leistungId angeben.' });
    }

    const verfuegbarkeit = await getFreieTermine(leistungId);
    res.json(verfuegbarkeit);
  } catch (error) {
    console.error('Fehler beim Laden der freien Termine:', error);
    res.status(500).json({ error: 'Serverfehler beim Berechnen der Termine: ' + error.message });
  }
}