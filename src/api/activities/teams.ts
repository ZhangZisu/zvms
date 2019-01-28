import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { Activity, ActivityState } from "../../entity/activity";
import { Chance } from "../../entity/chance";
import { Team } from "../../entity/team";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";
import { canOperate } from "./utils";

export const ActivityTeamsRouter = Router();

// 创建义工团队
ActivityTeamsRouter.post("/:id/team", Wrap(async (req, res) => {
    const Activities = getManager().getRepository(Activity);
    const activity = await Activities.findOne(req.params.id);
    ensure(activity, ERR_NOT_FOUND);
    ensure(activity.state === ActivityState.Registration, ERR_BAD_REQUEST);

    // 公开报名：任何人可以创建自己，团支书可以创建本班的人，管理员可以创建所有人
    const Users = getManager().getRepository(User);
    const leader = await Users.findOne(req.body.leaderId);
    ensure(leader, ERR_NOT_FOUND);
    const Chances = getManager().getRepository(Chance);
    const chance = await Chances.findOne({ groupId: leader.groupId, activityId: activity.id });
    ensure(chance, ERR_ACCESS_DENIED);
    ensure(chance.quota, ERR_ACCESS_DENIED);
    ensure(canOperate(req.user, leader, chance.type), ERR_ACCESS_DENIED);

    const Teams = getManager().getRepository(Team);
    const team = new Team();
    team.leader = leader;
    team.activity = activity;
    await Teams.save(team);

    res.RESTEnd();
}));
