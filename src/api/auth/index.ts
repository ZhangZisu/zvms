import { Router } from "express";
import { sign } from "jsonwebtoken";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_NOT_FOUND, SEC_SECRET } from "../../constant";
import { User } from "../../entity/user";
import { ensure, Wrap } from "../util";

export const AuthRouter = Router();

// 登录签发token
AuthRouter.post("/login", Wrap(async (req, res) => {
    const user = await User.findOne({ where: [{ name: req.body.username }, { email: req.body.username }], select: ["id", "hash", "salt"] });
    ensure(user, ERR_NOT_FOUND);
    ensure(user.verifyPassword(req.body.password), ERR_ACCESS_DENIED);
    ensure(!user.isRemoved, ERR_ACCESS_DENIED);
    const token = sign({ id: user.id }, SEC_SECRET, { expiresIn: "1d" });
    return res.RESTSend({ token, userId: user.id });
}));
