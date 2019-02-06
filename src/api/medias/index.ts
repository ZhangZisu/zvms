import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { ActivityState } from "../../entity/activity";
import { Media } from "../../entity/media";
import { Member } from "../../entity/member";
import { ensure, LoadPagination, LoadUser, Wrap } from "../util";

export const MediasRouter = Router();

MediasRouter.get("/", LoadPagination, Wrap(async (req, res) => {
    res.RESTSend(await Media.findAndCount(req.pagination));
}));

MediasRouter.get("/:id", Wrap(async (req, res) => {
    //
}));

MediasRouter.use(LoadUser);

MediasRouter.post("/", Wrap(async (req, res) => {
    const member = await Member.findOne(req.body.memberId, { relations: ["activity", "team"] });
    ensure(member, ERR_NOT_FOUND);
    ensure(member.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);
    ensure(req.user.isAdmin || req.user.isManager || req.userId === member.team.leaderId || req.userId === member.userId, ERR_ACCESS_DENIED);

    const media = new Media();
    media.activity = member.activity;
    media.member = member;
    media.userId = member.userId;
    await media.save();

    res.RESTSend(media.id);
}));

MediasRouter.delete("/:id", Wrap(async (req, res) => {
    const media = await Media.findOne(req.params.id, { relations: ["activity"] });
    ensure(media, ERR_NOT_FOUND);
    ensure(media.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);
    await media.remove();
    res.RESTEnd();
}));
