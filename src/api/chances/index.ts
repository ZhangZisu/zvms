import { Router } from "express";
import { Wrap } from "../util";

export const ChancesRouter = Router();

ChancesRouter.post("/", Wrap(async (req, res) => {
    //
}));