import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_NOT_FOUND } from "../../constant";
import { Group } from "../../entity/group";
import { UserRoles } from "../../entity/user";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

const GroupsRouter = Router();

GroupsRouter.get("/", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const groups = await Groups.find();
    res.RESTSend(groups);
}));

GroupsRouter.get("/:id", Wrap(async (req, res) => {
    const Groups = getManager().getRepository(Group);
    const group = await Groups.findOne(req.params.id, { relations: ["users", "chances"] });
    ensure(group, ERR_NOT_FOUND);
    res.RESTSend(group);
}));

GroupsRouter.use(LoadUserMiddleware);

GroupsRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);
    //
}));

GroupsRouter.put("/:id", Wrap(async (req, res) => {
    //
}));

GroupsRouter.delete("/:id", Wrap(async (req, res) => {
    //
}));
