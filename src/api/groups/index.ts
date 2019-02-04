import { Router } from "express";
import { Like } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_NOT_FOUND, LIM_SEARCH_ITEMS } from "../../constant";
import { Group } from "../../entity/group";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

export const GroupsRouter = Router();

// 获取所有用户组
GroupsRouter.get("/", Wrap(async (req, res) => {
    const groups = await Group.find();
    res.RESTSend(groups);
}));

GroupsRouter.get("/s", Wrap(async (req, res) => {
    const groups = await Group.find({
        where: { name: Like(`%${req.query.q}%`) },
        take: LIM_SEARCH_ITEMS,
    });
    const group = await Group.findOne(req.query.q);
    if (group) { groups.unshift(group); }
    res.RESTSend(groups);
}));

// 获取用户组信息
GroupsRouter.get("/:id", Wrap(async (req, res) => {
    const group = await Group.findOne(req.params.id, { relations: ["users", "chances"] });
    ensure(group, ERR_NOT_FOUND);
    res.RESTSend(group);
}));

GroupsRouter.use(LoadUserMiddleware);

// 修改用户组
GroupsRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    const group = await Group.findOne(req.params.id);
    group.name = req.body.name;
    await group.save();
    res.RESTEnd();
}));

// （批量）创建用户组
GroupsRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    const requests = req.body instanceof Array ? req.body : [req.body];
    const result = [];
    for (const request of requests) {
        const group = new Group();
        group.name = request.name;
        await group.save();
        result.push(group.id);
    }
    res.RESTSend(result);
}));
