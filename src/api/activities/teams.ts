import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";
import { canOperateDuringReg } from "./utils";

export const ActivityTeamsRouter = Router();

ActivityTeamsRouter.get("/:id/teams", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);

    const teams = await Team.find({ activityId: req.params.id });
    res.RESTSend(teams);
}));

// 创建义工团队
ActivityTeamsRouter.post("/:id/teams", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);

    const activity = await Activity.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    const leader = await User.findOne(req.body.leaderId);
    ensure(leader, ERR_NOT_FOUND);
    ensure(leader.id === req.body.leaderId, ERR_BAD_REQUEST);
    const chance = await Chance.findOne({ groupId: leader.groupId, activityId: activity.id });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(canOperateDuringReg(req.user, leader, chance.isPublic), ERR_ACCESS_DENIED);

    const team = new Team();
    team.leader = leader;
    team.activity = activity;
    await team.save();

    res.RESTEnd();
}));

ActivityTeamsRouter.get("/:id/teams/:tid", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.tid = parseInt(req.params.tid, 10), ERR_BAD_REQUEST);

    const team = await Team.findOne(req.params.tid, { relations: ["leader", "members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === req.params.id, ERR_BAD_REQUEST);
    res.RESTSend(team);
}));

ActivityTeamsRouter.delete("/:id/teams/:tid", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.tid = parseInt(req.params.tid, 10), ERR_BAD_REQUEST);

    const team = await Team.findOne(req.params.tid, { relations: ["activity", "members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === req.params.id, ERR_BAD_REQUEST);
    ensure(team.activity.state === ActivityState.Registration, ERR_BAD_REQUEST);
    ensure(!team.members.length, ERR_BAD_REQUEST);
    await team.remove();
    res.RESTEnd();
}));

// 团队批处理操作
ActivityTeamsRouter.put("/:id/teams/:tid/members", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.params.tid = parseInt(req.params.tid, 10), ERR_BAD_REQUEST);

    const team = await Team.findOne(req.params.tid, { relations: ["activity", "members"] });
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === req.params.id, ERR_BAD_REQUEST);
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
