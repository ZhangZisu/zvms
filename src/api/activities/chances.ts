import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { ensure, Wrap } from "../util";

export const ActivityChancesRouter = Router();

// 创建义工分配
ActivityChancesRouter.post("/:id/chances", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    const Chances = getManager().getRepository(Chance);
    const chance = new Chance();
    chance.quota = req.body.quota;
    chance.type = req.body.type;
    chance.groupId = req.body.groupId;
    chance.activity = activity;
    await Chances.save(chance);

    res.RESTSend(chance.id);
}));

// 更新义工分配
ActivityChancesRouter.put("/:id/chances/:cid", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    const Chances = getManager().getRepository(Chance);
    const chance = await Chances.findOne(req.params.cid);
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activityId === activity.id, ERR_BAD_REQUEST);
    chance.quota = req.body.quota;
    chance.type = req.body.type;
    chance.groupId = req.body.groupId;
    await Chances.save(chance);

    res.RESTEnd();
}));

// 删除义工分配
ActivityChancesRouter.delete("/:id/chances/:cid", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    const Chances = getManager().getRepository(Chance);
    const chance = await Chances.findOne(req.params.cid);
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activityId === activity.id, ERR_BAD_REQUEST);
    await Chances.remove(chance);

    res.RESTEnd();
}));
