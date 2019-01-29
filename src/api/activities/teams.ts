import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";
import { canOperateDuringReg } from "./utils";

export const ActivityTeamsRouter = Router();

// 创建义工团队
ActivityTeamsRouter.post("/:id/teams", Wrap(async (req, res) => {
    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    // 公开报名：任何人可以创建自己，团支书可以创建本班的人，管理员可以创建所有人
    const leader = await User.findOne(req.body.leaderId);
    ensure(leader, ERR_NOT_FOUND);
    const chance = await Chance.findOne({ groupId: leader.groupId, activityId: activity.id });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(canOperateDuringReg(req.user, leader, chance.type), ERR_ACCESS_DENIED);

    const team = new Team();
    team.leader = leader;
    team.activity = activity;
    await team.save();

    res.RESTEnd();
}));

// 团队批处理操作
ActivityTeamsRouter.put("/:id/teams/:tid/members", Wrap(async (req, res) => {
    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);

    const team = await Team.findOne(req.params.tid, { relations: ["members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === activity.id, ERR_BAD_REQUEST);
    ensure(req.userId === team.leaderId || req.user.isAdministrator || req.user.isManager, ERR_ACCESS_DENIED);

    for (const member of team.members) {
        member.comment = req.body.comment;
        member.leaderReview = req.body.leaderReview;
        if (req.user.isManager || req.user.isAdministrator) {
            member.iTime = req.body.iTime;
            member.oTime = req.body.oTime;
            member.uTime = req.body.uTime;
            member.managerReview = req.body.managerReview;
            if (req.user.isAdministrator) {
                member.administratorReview = req.body.administratorReview;
            }
        }
        await member.save();
    }

    res.RESTEnd();
}));
