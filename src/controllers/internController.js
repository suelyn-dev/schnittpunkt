import { holeTagesansicht, holeAlleTermine, loescheTermin, terminErledigt, noShowTermin, aendereLeistung, insertLeistungService, deleteLeistungService } from "../services/internService.js";

export async function getHeute(req, res) {
  res.json(await holeTagesansicht());
}

export async function getAlle(req, res) {
  res.json(await holeAlleTermine());
}

export async function deleteTerminIntern(req, res) {
  const ok = await loescheTermin(req.params.terminId);
  if (!ok) return res.status(404).json({ message: "Termin nicht gefunden." });
  res.json({ message: "Termin erfolgreich gelöscht!" });
}

export async function erledigtTerminIntern(req, res) {
  const ok = await terminErledigt(req.params.terminId);
  if (!ok) return res.status(404).json({ message: "Termin abgehakt." });
  res.json({ message: "Termin erfolgreich als erledigt markiert!" });
}

export async function noShowTerminIntern(req, res) {
  const ok = await noShowTermin(req.params.terminId);
  if (!ok) return res.status(404).json({ message: "Termin nicht gekommen." });
  res.json({ message: "Termin als no-show markiert!" });
}

export async function putLeistung(req, res) {
  try {
    const ok = await aendereLeistung(req.params.leistungId, req.body);
    if (!ok) return res.status(404).json({ error: "Leistung nicht gefunden" });
    res.json({ message: "Leistung erfolgreich geändert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function postLeistung(req, res) {
  try {
    const id = await insertLeistungService(req.body);
    res.status(201).json({ message: "Leistung erstellt", leistung_id: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteLeistungController(req, res) {
  try {
    const ok = await deleteLeistungService(req.params.leistungId);
    if (!ok) return res.status(404).json({ error: "Leistung nicht gefunden" });
    res.json({ message: "Leistung erfolgreich gelöscht" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kann nicht gelöscht werden (evtl. noch Termine gebucht)" });
  }
}
