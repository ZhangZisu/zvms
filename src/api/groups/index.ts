import { Router } from "express";
import { getManager, Like } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_NOT_FOUND, LIM_SEARCH_ITEMS } from "../../constant";
import { Group } from "../../entity/group";
import { ensure, LoadPagination, LoadUser, Wrap } from "../util";

export const GroupsRouter = Router();

// 获取所有用户组
GroupsRouter.get("/", LoadPagination, Wrap(async (req, res) => {
    res.RESTSend(await Group.findAndCount(req.pagination));
}));

// 获取用户组信息
GroupsRouter.get("/:id", Wrap(async (req, res) => {
    const group = await Group.findOne(req.params.id, { relations: ["users", "chances"] });
    ensure(group, ERR_NOT_FOUND);
    res.RESTSend(group);
}));

GroupsRouter.use(LoadUser);

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
    const result: number[] = [];
    await getManager().transaction(async (manager) => {
        for (const request of requests) {
            const group = new Group();
            group.name = request.name;
            await manager.save(group);
            result.push(group.id);
        }
    });
    res.RESTSend(result);
}));
