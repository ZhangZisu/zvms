import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Member } from "../../entity/member";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";
import { canOperate } from "./utils";

export const ActivityMembersRouter = Router();

// 创建义工成员
ActivityMembersRouter.post("/:id/member", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    const Users = getManager().getRepository(User);
    const user = await Users.findOne(req.body.userId);
    ensure(user, ERR_NOT_FOUND);
    const Chances = getManager().getRepository(Chance);
    const chance = await Chances.findOne({ groupId: user.groupId, activityId: activity.id });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(canOperate(req.user, user, chance.type), ERR_ACCESS_DENIED);

    const Teams = getManager().getRepository(Team);
    const team = await Teams.findOne(req.body.teamId);
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === activity.id, ERR_BAD_REQUEST);

    const Members = getManager().getRepository(Member);
    const member = new Member();
    member.user = user;
    member.team = team;
    member.activity = activity;

    await Members.save(member);
    chance.quota--;
    await Chances.save(chance);

    res.RESTEnd();
}));

// 删除义工成员
ActivityMembersRouter.post("/:id/member/:mid", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    const Members = getManager().getRepository(Member);
    const member = await Members.findOne(req.params.mid, { relations: ["user"] });
    ensure(member, ERR_NOT_FOUND);
    ensure(member.activityId === activity.id, ERR_BAD_REQUEST);

    const Chances = getManager().getRepository(Chance);
    const chance = await Chances.findOne({ groupId: member.user.groupId, activityId: activity.id });
    ensure(canOperate(req.user, member.user, chance.type), ERR_ACCESS_DENIED);

    await Members.remove(member);
    chance.quota++;
    await Chances.save(chance);

    res.RESTEnd();
}));
