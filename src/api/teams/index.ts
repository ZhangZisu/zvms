import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { canOperateDuringReg, ensure, LoadUser, Wrap } from "../util";

export const TeamsRouter = Router();

TeamsRouter.get("/:id", Wrap(async (req, res) => {
    const team = await Team.findOne(req.params.id, { relations: ["leader", "members"] });
    ensure(team, ERR_NOT_FOUND);
    res.RESTSend(team);
}));

TeamsRouter.use(LoadUser);

// 创建义工团队
TeamsRouter.post("/", Wrap(async (req, res) => {
    const leader = await User.findOne(req.body.leaderId);
    ensure(leader, ERR_NOT_FOUND);
    ensure(leader.id === req.body.leaderId, ERR_BAD_REQUEST);
    const chance = await Chance.findOne({ where: { groupId: leader.groupId, activityId: req.body.activityId }, relations: ["activity"] });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(chance.activity, ERR_NOT_FOUND);
    ensure(chance.activity.state === ActivityState.Registration, ERR_BAD_REQUEST);
    ensure(canOperateDuringReg(req.user, leader, chance.activity.isPublic), ERR_ACCESS_DENIED);

    const team = new Team();
    team.leader = leader;
    team.activity = chance.activity;
    await team.save();

    res.RESTEnd();
}));

TeamsRouter.delete("/:id", Wrap(async (req, res) => {
    const team = await Team.findOne(req.params.id, { relations: ["activity", "members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activity.state === ActivityState.Registration, ERR_BAD_REQUEST);
    ensure(!team.members.length, ERR_BAD_REQUEST);
    await team.remove();
    res.RESTEnd();
}));

// 团队批处理操作
TeamsRouter.put("/:id/members", Wrap(async (req, res) => {
    const team = await Team.findOne(req.params.id, { relations: ["activity", "members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(req.userId === team.leaderId || req.user.isAdmin || req.user.isManager, ERR_ACCESS_DENIED);
    ensure(team.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);

    await getManager().transaction(async (manager) => {
        for (const member of team.members) {
            member.comment = req.body.comment || member.comment;
            member.isLeaderApproved = req.body.isLeaderApproved;
            if (req.user.isManager || req.user.isAdmin) {
                member.iTime = req.body.iTime;
                member.oTime = req.body.oTime;
                member.uTime = req.body.uTime;
                member.isManagerApproved = req.body.isManagerApproved;
                if (req.user.isAdmin) {
                    member.isAdminApproved = req.body.isAdminApproved;
                }
            }
            await manager.save(member);
        }
    });

    res.RESTEnd();
}));
