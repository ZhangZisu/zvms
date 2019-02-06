import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Media } from "../../entity/media";
import { Member } from "../../entity/member";
import { Team } from "../../entity/team";
import { ensure, LoadPagination, LoadUser, Wrap } from "../util";

export const ActivitiesRouter = Router();

// 获取所有活动
ActivitiesRouter.get("/", LoadPagination, Wrap(async (req, res) => {
    res.RESTSend(await Activity.findAndCount(req.pagination));
}));

// 获取指定活动及关联资源
ActivitiesRouter.get("/:id", Wrap(async (req, res) => {
    const activity = await Activity.findOne(req.params.id, { relations: ["chances", "teams", "members", "owner", "medias"] });
    ensure(activity, ERR_NOT_FOUND);
    res.RESTSend(activity);
}));

ActivitiesRouter.use(LoadUser);

// 创建活动
ActivitiesRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdmin || (req.user.isProvider && req.userId === req.body.ownerId), ERR_ACCESS_DENIED);

    const activity = new Activity();
    activity.name = req.body.name;
    activity.description = req.body.description || activity.description;
    activity.ownerId = req.body.ownerId;
    activity.isPublic = req.body.isPublic;
    await activity.save();
    res.RESTSend(activity.id);
}));

// 更新活动
ActivitiesRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdmin || (req.user.isProvider && req.userId === req.body.ownerId), ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id);
    ensure(req.user.isAdmin || req.userId === activity.ownerId, ERR_ACCESS_DENIED);
    ensure(activity, ERR_NOT_FOUND);
    activity.name = req.body.name;
    activity.description = req.body.description || activity.description;
    activity.ownerId = req.body.ownerId;
    if (activity.state === ActivityState.PendingApprove) {
        activity.isPublic = req.body.isPublic;
    }
    await activity.save();
    res.RESTEnd();
}));

// 更改活动状态（单向）
ActivitiesRouter.post("/:id/changestate", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state !== ActivityState.Finished, ERR_BAD_REQUEST);
    activity.state++;
    await activity.save();
    res.RESTEnd();
}));

// 计算贡献
ActivitiesRouter.post("/:id/compute", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id, { relations: ["members", "members.user"] });
    ensure(activity, ERR_NOT_FOUND);
    ensure(!activity.isComputed && activity.state === ActivityState.Finished, ERR_BAD_REQUEST);

    await getManager().transaction(async (manager) => {
        activity.isComputed = true;
        await manager.save(activity);
        for (const member of activity.members) {
            if (member.isLeaderApproved && member.isManagerApproved && member.isAdminApproved) {
                member.user.iTime += member.iTime;
                member.user.oTime += member.oTime;
                member.user.uTime += member.uTime;
                await manager.save(member.user);
            }
        }
    });

    res.RESTEnd();
}));

// 活动批量更新
ActivitiesRouter.put("/:id/members", Wrap(async (req, res) => {
    ensure(req.user.isAdmin || req.user.isManager, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id, { relations: ["members"] });
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);

    await getManager().transaction(async (manager) => {
        for (const member of activity.members) {
            member.iTime = req.body.iTime;
            member.oTime = req.body.oTime;
            member.uTime = req.body.uTime;
            member.comment = req.body.comment || member.comment;
            member.isLeaderApproved = req.body.isLeaderApproved;
            member.isManagerApproved = req.body.isManagerApproved;
            if (req.user.isAdmin) {
                member.isAdminApproved = req.body.isAdminApproved;
            }
            await manager.save(member);
        }
    });

    res.RESTEnd();
}));

ActivitiesRouter.get("/:id/chances", Wrap(async (req, res) => {
    const chances = await Chance.find({ activityId: req.params.id });
    res.RESTSend(chances);
}));

ActivitiesRouter.get("/:id/teams", Wrap(async (req, res) => {
    const teams = await Team.find({ activityId: req.params.id });
    res.RESTSend(teams);
}));

ActivitiesRouter.get("/:id/members", Wrap(async (req, res) => {
    const members = await Member.find({ activityId: req.params.id });
    res.RESTSend(members);
}));

ActivitiesRouter.get("/:id/medias", Wrap(async (req, res) => {
    const medias = await Media.find({ activityId: req.params.id });
    res.RESTSend(medias);
}));
