import { Router } from "express";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST } from "../../constant";
import { User } from "../../entity/user";
import { ensure, LoadUserMiddleware, Wrap } from "../util";

export const UsersRouter = Router();

// 获取所有用户
UsersRouter.get("/", Wrap(async (req, res) => {
    const users = await User.find();
    res.RESTSend(users);
}));

// 获取用户信息
UsersRouter.get("/:id", Wrap(async (req, res) => {
    const user = await User.findOne(req.params.id, { relations: ["group", "history"] });
    res.send(user);
}));

UsersRouter.use(LoadUserMiddleware);

// 更新用户
UsersRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator || req.userId === req.params.id, ERR_ACCESS_DENIED);
    const user = await User.findOne(req.params.id);
    user.email = req.body.email;
    if (req.body.password) { user.setPassword(req.body.password); }
    if (req.user.isAdministrator) {
        user.name = req.body.name;
        user.isSecretary = req.body.isSecretary;
        user.isManager = req.body.isManager;
        user.isAdministrator = req.body.isAdministrator;
        user.isProvider = req.body.isProvider;
        user.groupId = req.body.groupId;
        user.removed = req.body.removed;
    }
    await user.save();
    res.RESTEnd();
}));

// （批量）创建用户
UsersRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdministrator, ERR_ACCESS_DENIED);
    const requests = req.body instanceof Array ? req.body : [req.body];
    const result = [];
    for (const request of requests) {
        const user = new User();
        user.name = request.name;
        user.email = request.email;
        user.setPassword(request.password);
        user.isSecretary = request.isSecretary;
        user.isManager = request.isManager;
        user.isAdministrator = request.isAdministrator;
        user.isProvider = request.isProvider;
        user.groupId = request.groupId;
        await user.save();
        result.push(user.id);
    }
    res.RESTSend(result);
}));
