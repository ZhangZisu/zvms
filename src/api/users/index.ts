import { Router } from "express";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND } from "../../constant";
import { User } from "../../entity/user";
import { ensure, LoadPagination, LoadUser, Wrap } from "../util";

export const UsersRouter = Router();

// 获取所有用户
UsersRouter.get("/", LoadPagination, Wrap(async (req, res) => {
    res.RESTSend(await User.findAndCount(req.pagination));
}));

// 获取用户信息
UsersRouter.get("/:id", Wrap(async (req, res) => {
    const user = await User.findOne(req.params.id, { relations: ["history", "medias"] });
    ensure(user, ERR_NOT_FOUND);
    res.RESTSend(user);
}));

UsersRouter.use(LoadUser);

// 更新用户
UsersRouter.put("/:id", Wrap(async (req, res) => {
    ensure(req.params.id = parseInt(req.params.id, 10), ERR_BAD_REQUEST);
    ensure(req.user.isAdmin || req.userId === req.params.id, ERR_ACCESS_DENIED);

    const user = await User.findOne(req.params.id);
    user.email = req.body.email;
    user.description = req.body.description || user.description;
    if (req.body.password) { user.setPassword(req.body.password); }
    if (req.user.isAdmin) {
        user.name = req.body.name;
        user.isSecretary = req.body.isSecretary;
        user.isManager = req.body.isManager;
        user.isAdmin = req.body.isAdmin;
        user.isProvider = req.body.isProvider;
        user.groupId = req.body.groupId;
        user.isRemoved = req.body.isRemoved;
    }
    await user.save();
    res.RESTEnd();
}));

// （批量）创建用户
UsersRouter.post("/", Wrap(async (req, res) => {
    ensure(req.user.isAdmin, ERR_ACCESS_DENIED);
    const requests = req.body instanceof Array ? req.body : [req.body];
    const result: number[] = [];
    await getManager().transaction(async (manager) => {
        for (const request of requests) {
            const user = new User();
            user.name = request.name;
            user.email = request.email;
            user.description = request.description || user.description;
            user.setPassword(request.password);
            user.isSecretary = request.isSecretary;
            user.isManager = request.isManager;
            user.isAdmin = request.isAdmin;
            user.isProvider = request.isProvider;
            user.groupId = request.groupId;
            await manager.save(user);
            result.push(user.id);
        }
    });
    res.RESTSend(result);
}));
