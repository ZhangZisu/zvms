import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Member, ReviewResult } from "../../entity/member";
import { ensure, LoadUserMiddleware, Wrap } from "../util";
import { ActivityChancesRouter } from "./chances";
import { ActivityMembersRouter } from "./members";
import { ActivityTeamsRouter } from "./teams";

export const ActivitiesRouter = Router();

// 获取所有活动
ActivitiesRouter.get("/", Wrap(async (req, res) => {
    const activitys = await Activity.find();
    res.RESTSend(activitys);
}));

// 获取指定活动及关联资源
ActivitiesRouter.get("/:id", Wrap(async (req, res) => {
    const activity = await Activity.findOne(req.params.id, { relations: ["chances", "teams", "members"] });
    ensure(activity, ERR_NOT_FOUND);
    res.RESTSend(activity);
}));

ActivitiesRouter.use(LoadUserMiddleware);

// 创建活动
ActivitiesRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator || (req.user.isProvider && req.userId === req.body.ownerId), ERR_ACCESS_DENIED);

    const activity = new Activity();
    activity.name = req.body.name;
    activity.description = req.body.description;
    activity.owner = req.user;
    await activity.save();
    res.RESTSend(activity.id);
}));

// 更新活动
ActivitiesRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator || (req.user.isProvider && req.userId === req.body.ownerId), ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id);
    ensure(req.user.isAdministrator || req.userId === activity.ownerId, ERR_ACCESS_DENIED);
    ensure(activity, ERR_NOT_FOUND);
    activity.name = req.body.name;
    activity.description = req.body.description;
    activity.ownerId = req.body.ownerId;
    await activity.save();
    res.RESTEnd();
}));

// 更改活动状态（单向）
ActivitiesRouter.post("/:id/changestate", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state !== ActivityState.Finished, ERR_BAD_REQUEST);
    activity.state++;
    await activity.save();
    res.RESTEnd();
}));

// 计算贡献
ActivitiesRouter.post("/:id/compute", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id, { relations: ["members", "members.user"] });
    ensure(activity, ERR_NOT_FOUND);
    ensure(!activity.isComputed && activity.state === ActivityState.Finished, ERR_BAD_REQUEST);

    activity.isComputed = true;
    await activity.save();

    for (const member of activity.members) {
        if ([member.leaderReview, member.managerReview, member.administratorReview].every((review) => review === ReviewResult.Approved)) {
            member.user.iTime += member.iTime;
            member.user.oTime += member.oTime;
            member.user.uTime += member.uTime;
            await member.user.save();
        }
    }

    res.RESTEnd();
}));

// 活动批量更新
ActivitiesRouter.put("/:id/members", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator || req.user.isManager, ERR_ACCESS_DENIED);

    const activity = await Activity.findOne(req.params.id, { relations: ["members"] });
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);

    for (const member of activity.members) {
        member.iTime = req.body.iTime;
        member.oTime = req.body.oTime;
        member.uTime = req.body.uTime;
        member.comment = req.body.comment;
        member.leaderReview = req.body.leaderReview;
        member.managerReview = req.body.managerReview;
        if (req.user.isAdministrator) {
            member.administratorReview = req.body.administratorReview;
        }
        await member.save();
    }

    res.RESTEnd();
}));

ActivitiesRouter.use(ActivityChancesRouter);
ActivitiesRouter.use(ActivityTeamsRouter);
ActivitiesRouter.use(ActivityMembersRouter);
