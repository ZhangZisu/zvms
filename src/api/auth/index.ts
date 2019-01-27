import { Router } from "express";
import { sign } from "jsonwebtoken";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_NOT_FOUND, SEC_SECRET } from "../../constant";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";

export const AuthRouter = Router();

AuthRouter.post("/login", Wrap(async (req, res) => {
    const Users = getManager().getRepository(User);
    const user = await Users.createQueryBuilder("user")
        .where("user.id = :username OR user.name = :username", { username: req.body.username })
        .addSelect("user.hash")
        .addSelect("user.salt")
        .getOne();
    ensure(user, ERR_NOT_FOUND);
    ensure(user.verifyPassword(req.body.password), ERR_ACCESS_DENIED);
    const token = sign({ id: user.id }, SEC_SECRET, { expiresIn: "1d" });
    return res.RESTSend(token);
}));
