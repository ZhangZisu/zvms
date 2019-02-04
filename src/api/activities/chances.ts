import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { ensure, Wrap } from "../util";

export const ActivityChancesRouter = Router();

// 获取分配信息，可用于前端局部更新义工事件
ActivityChancesRouter.get("/:id/chances", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);

    const chances = await Chance.find({ activityId: req.params.id });
    res.RESTSend(chances);
}));

// 创建义工分配
ActivityChancesRouter.post("/:id/chances", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);

    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    const chance = new Chance();
    chance.quota = req.body.quota;
    chance.isPublic = req.body.isPublic;
    chance.groupId = req.body.groupId;
    chance.activity = activity;
    await chance.save();

    res.RESTSend(chance.id);
}));

ActivityChancesRouter.get("/:id/chances/:cid", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.cid = parseInt(req.params.cid, 10), ERR_BAD_REQUEST);

    const chance = await Chance.findOne(req.params.cid, { relations: ["group"] });
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activityId === req.params.id, ERR_BAD_REQUEST);
    res.RESTSend(chance);
}));

// 更新义工分配
ActivityChancesRouter.put("/:id/chances/:cid", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.cid = parseInt(req.params.cid, 10), ERR_BAD_REQUEST);

    const chance = await Chance.findOne(req.params.cid, { relations: ["activity"] });
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activityId === req.params.id, ERR_BAD_REQUEST);
    ensure(chance.activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    chance.quota = req.body.quota;
    chance.isPublic = req.body.isPublic;
    chance.groupId = req.body.groupId;
    await chance.save();

    res.RESTEnd();
}));

// 删除义工分配
ActivityChancesRouter.delete("/:id/chances/:cid", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.cid = parseInt(req.params.cid, 10), ERR_BAD_REQUEST);

    const chance = await Chance.findOne(req.params.cid, { relations: ["activity"] });
    ensure(chance, ERR_NOT_FOUND);
    ensure(chance.activityId === req.params.id, ERR_BAD_REQUEST);
    ensure(chance.activity.state === ActivityState.Approved, ERR_BAD_REQUEST);

    await chance.remove();

    res.RESTEnd();
}));
