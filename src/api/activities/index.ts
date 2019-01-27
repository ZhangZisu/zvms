import { Router } from "express";
import { getManager } from "typeorm";
import { Activity } from "../../entity/activity";
import { Wrap } from "../util";

export const ActivitiesRouter = Router();

ActivitiesRouter.get("/", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activitys = await Activities.find();
    res.RESTSend(activitys);
}));

ActivitiesRouter.get("/:id", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activity = Activities.findOne(req.params.id);
    res.RESTSend(activity);
}));
