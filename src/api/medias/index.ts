import { Router } from "express";
import { move, pathExists, unlink } from "fs-extra";
import multer = require("multer");
import { tmpdir } from "os";
import { join } from "path";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND, LIM_MIMES, PATH_MEDIA } from "../../constant";
import { ActivityState } from "../../entity/activity";
import { Media } from "../../entity/media";
import { Member } from "../../entity/member";
import { ensure, LoadPagination, LoadUser, Wrap } from "../util";

export const MediasRouter = Router();
const uploader = multer({ dest: tmpdir() });

MediasRouter.get("/", LoadPagination, Wrap(async (req, res) => {
    res.RESTSend(await Media.findAndCount(req.pagination));
}));

MediasRouter.get("/:id", Wrap(async (req, res) => {
    const media = await Media.findOne(req.params.id);
    ensure(media, ERR_NOT_FOUND);
    res.sendFile(join(PATH_MEDIA, media.id.toString(16)), { headers: { "Content-Type": media.mimeType } });
}));

MediasRouter.use(LoadUser);

MediasRouter.post("/", uploader.single("file"), Wrap(async (req, res) => {
    ensure(LIM_MIMES.includes(req.file.mimetype), ERR_BAD_REQUEST);

    const member = await Member.findOne(req.body.memberId, { relations: ["activity", "team"] });
    ensure(member, ERR_NOT_FOUND);
    ensure(member.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);
    ensure(req.user.isAdmin || req.user.isManager || req.userId === member.team.leaderId || req.userId === member.userId, ERR_ACCESS_DENIED);

    const media = new Media();
    media.name = req.file.originalname;
    media.mimeType = req.file.mimetype;
    media.activity = member.activity;
    media.member = member;
    media.userId = member.userId;
    await media.save();
    await move(req.file.path, join(PATH_MEDIA, media.id.toString(16)));

    res.RESTSend(media.id);
}));

MediasRouter.delete("/:id", Wrap(async (req, res) => {
    const media = await Media.findOne(req.params.id, { relations: ["activity"] });
    ensure(media, ERR_NOT_FOUND);
    ensure(media.activity.state === ActivityState.PendingVerify, ERR_BAD_REQUEST);
    const path = join(PATH_MEDIA, media.id.toString(16));
    if (await pathExists(path)) {
        await unlink(path);
    }
    await media.remove();
    res.RESTEnd();
}));
