import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST } from "../../constant";
import { User, UserRoles } from "../../entity/user";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

export const UsersRouter = Router();

UsersRouter.get("/", Wrap(async (req, res) => {
    const Users = getManager().getRepository(User);
    const users = await Users.find({ relations: ["group"] });
    res.RESTSend(users);
}));

UsersRouter.get("/:id", Wrap(async (req, res) => {
    const Users = getManager().getRepository(User);
    const user = await Users.findOne(req.params.id);
    res.send(user);
}));

UsersRouter.use(LoadUserMiddleware);

UsersRouter.put("/:id", Wrap(async (req, res) => {
    const Users = getManager().getRepository(User);
    const user = await Users.findOne(req.params.id);
    ensure(req.user.role >= UserRoles.Administrator || req.userID === req.params.id, ERR_ACCESS_DENIED);
    user.email = req.body.email || user.email;
    if (req.body.password) { user.setPassword(req.body.password); }
    if (req.user.role >= UserRoles.Administrator) {
        user.name = req.body.name || user.name;
        user.role = req.body.role || user.role;
        user.groupId = req.body.groupId || user.groupId;
    }
    await Users.save(user);
    res.RESTEnd();
}));

UsersRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.role >= UserRoles.Administrator, ERR_ACCESS_DENIED);
    const Users = getManager().getRepository(User);
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.role = req.body.role;
    await Users.save(user);
    res.RESTEnd();
}));
