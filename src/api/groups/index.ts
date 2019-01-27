import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED } from "../../constant";
import { Group } from "../../entity/group";
import { UserRoles } from "../../entity/user";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

export const GroupsRouter = Router();

GroupsRouter.get("/", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const groups = await Groups.find();
    res.RESTSend(groups);
}));

GroupsRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);
    const Groups = getManager().getRepository(Group);
    const group = new Group();
    group.name = req.body.name;
    await Groups.save(group);
    res.RESTEnd();
}));

GroupsRouter.get("/:id", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const group = await Groups.findOne(req.params.id);
    res.send(group);
}));

GroupsRouter.use(LoadUserMiddleware);

GroupsRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);
    const Groups = getManager().getRepository(Group);
    const group = await Groups.findOne(req.params.id);
    group.name = req.body.name || group.name;
    await Groups.save(group);
    res.RESTEnd();
}));
