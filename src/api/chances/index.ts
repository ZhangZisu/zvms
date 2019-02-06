import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { ensure, LoadUser, Wrap } from "../util";

export const ChancesRouter = Router();

ChancesRouter.get("/:id", Wrap(async (req, res) => {
    const chance = await Chance.findOne(req.params.id, { relations: ["group"] });
    ensure(chance, ERR_NOT_FOUND);
    res.RESTSend(chance);
}));

ChancesRouter.use(LoadUser);

// 创建义工分配
ChancesRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.body.activityId);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    const chance = new Chance();
    chance.quota = req.body.quota;
    chance.groupId = req.body.groupId;
    chance.activity = activity;
    await chance.save();

    res.RESTSend(chance.id);
}));

// 更新义工分配
ChancesRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);

    const chance = await Chance.findOne(req.params.id, { relations: ["activity"] });
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    chance.quota = req.body.quota;
    chance.groupId = req.body.groupId;
    await chance.save();

    res.RESTEnd();
}));

// 删除义工分配
ChancesRouter.delete("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);

    const chance = await Chance.findOne(req.params.id, { relations: ["activity"] });
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    await chance.remove();

    res.RESTEnd();
}));
