import { holeTagesansicht, holeAlleTermine, loescheTermin, terminErledigt, noShowTermin } from "../services/internService.js";

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