import express from "express";
import { getHeute, getAlle, deleteTerminIntern, noShowTerminIntern, erledigtTerminIntern } from "../controllers/internController.js";

export const router = express.Router();

router.get("/heute", getHeute);
router.get("/alle", getAlle);
router.delete("/termine/:terminId", deleteTerminIntern);
router.patch("/termine/:terminId/noshow", noShowTerminIntern);
router.patch("/termine/:terminId/erledigt", erledigtTerminIntern);
