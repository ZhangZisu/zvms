import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { UserRoles } from "../../entity/user";
import { ensure, LoadUserMiddleware, Wrap } from "../util";
import { ActivityChancesRouter } from "./chances";
import { ActivityMembersRouter } from "./members";
import { ActivityTeamsRouter } from "./teams";

export const ActivitiesRouter = Router();

// 获取所有活动
ActivitiesRouter.get("/", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activitys = await Activities.find();
    res.RESTSend(activitys);
}));

// 获取指定活动及关联资源
ActivitiesRouter.get("/:id", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id, { relations: ["chances", "teams", "members"] });
    ensure(activity, ERR_NOT_FOUND);
    res.RESTSend(activity);
}));

ActivitiesRouter.use(LoadUserMiddleware);

// 创建活动
ActivitiesRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = new Activity();
    activity.name = req.body.name;
    activity.description = req.body.description;
    await Activities.save(activity);
    res.RESTSend(activity.id);
}));

// 更新活动
ActivitiesRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    activity.name = req.body.name || activity.name;
    activity.description = req.body.description || activity.description;
    await Activities.save(activity);
    res.RESTEnd();
}));

// 更改活动状态
ActivitiesRouter.post("/:id/changestate", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);

    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state !== ActivityState.Finished, ERR_BAD_REQUEST);
    activity.state++;
    await Activities.save(activity);
    res.RESTEnd();
}));

ActivitiesRouter.use(ActivityChancesRouter);
ActivitiesRouter.use(ActivityTeamsRouter);
ActivitiesRouter.use(ActivityMembersRouter);
