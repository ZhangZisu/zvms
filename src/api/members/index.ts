import { Router } from "express";
import { getConnection } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Member } from "../../entity/member";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { canOperateDuringReg, ensure, LoadUser, Wrap } from "../util";

export const MembersRouter = Router();

MembersRouter.get("/:id", Wrap(async (req, res) => {
    const member = await Member.findOne(req.params.id, { relations: ["user", "medias"] });
    ensure(member, ERR_NOT_FOUND);
    res.RESTSend(member);
}));

MembersRouter.use(LoadUser);

MembersRouter.post("/", Wrap(async (req, res) => {
    const user = await User.findOne(req.body.userId);
    ensure(user, ERR_NOT_FOUND);
    ensure(user.id === req.body.userId, ERR_BAD_REQUEST);
    const chance = await Chance.findOne({ where: { groupId: user.groupId, activityId: req.body.activityId }, relations: ["activity"] });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(chance.activity, ERR_NOT_FOUND);
    ensure(chance.activity.state === ActivityState.Registration, ERR_BAD_REQUEST);
    ensure(canOperateDuringReg(req.user, user, chance.activity.isPublic), ERR_ACCESS_DENIED);

    const team = await Team.findOne(req.body.teamId);
    ensure(team, ERR_NOT_FOUND);
    ensure(team.activityId === chance.activity.id, ERR_BAD_REQUEST);
    ensure(team.id === req.body.teamId, ERR_BAD_REQUEST);

    const member = new Member();
    member.user = user;
    member.team = team;
    member.activity = chance.activity;
    chance.quota--;

    await getConnection().transaction(async (manager) => {
        await manager.save(chance);
        await manager.save(member);
    });

    res.RESTSend(member.id);
}));

MembersRouter.delete("/:id", Wrap(async (req, res) => {
    const member = await Member.findOne(req.params.id, { relations: ["user", "activity"] });
    ensure(member, ERR_NOT_FOUND);
    ensure(member.activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    const chance = await Chance.findOne({ groupId: member.user.groupId, activityId: member.activity.id });
    ensure(canOperateDuringReg(req.user, member.user, member.activity.isPublic), ERR_ACCESS_DENIED);
    chance.quota++;

    await getConnection().transaction(async (manager) => {
        await manager.save(chance);
        await manager.remove(member);
    });

    res.RESTEnd();
}));

MembersRouter.put("/:id", Wrap(async (req, res) => {
    const member = await Member.findOne(req.params.id, { relations: ["team", "activity"] });
    ensure(member, ERR_NOT_FOUND);
    ensure(req.userId === member.team.leaderId || req.user.isAdmin || req.user.isManager, ERR_ACCESS_DENIED);
    ensure(member.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);

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
    await member.save();

    res.RESTEnd();
}));
