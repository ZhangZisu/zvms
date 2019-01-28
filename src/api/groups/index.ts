import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_NOT_FOUND } from "../../constant";
import { Group } from "../../entity/group";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

const GroupsRouter = Router();

// 获取所有用户组
GroupsRouter.get("/", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const groups = await Groups.find();
    res.RESTSend(groups);
}));

// 获取用户组信息
GroupsRouter.get("/:id", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const group = await Groups.findOne(req.params.id, { relations: ["users", "chances"] });
    ensure(group, ERR_NOT_FOUND);
    res.RESTSend(group);
}));

GroupsRouter.use(LoadUserMiddleware);

// 修改用户组
GroupsRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);
    const Groups = getManager().getRepository(Group);
    const group = await Groups.findOne(req.params.id);
    group.name = req.body.name;
    await Groups.save(group);
    res.RESTEnd();
}));

// （批量）创建用户组
GroupsRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);
    const Groups = getManager().getRepository(Group);
    const requests = req.body instanceof Array ? req.body : [req.body];
    const result = [];
    for (const request of requests) {
        const group = new Group();
        group.name = req.body.name;
        await Groups.save(group);
        result.push(group.id);
    }
    res.RESTSend(result);
}));
