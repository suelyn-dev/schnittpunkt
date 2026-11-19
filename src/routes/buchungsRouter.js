import express from "express";
import { postTermin, deleteTermin } from "../controllers/buchungsController.js";

export const router = express.Router();

router.post("/", postTermin);
router.delete("/storno/:token", deleteTermin);
