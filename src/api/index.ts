import { Router } from "express";
import { AuthRouter } from "./auth";
import { GroupsRouter } from "./groups";
import { UsersRouter } from "./users";
import { RESTMiddleware, TokenParseMiddleware } from "./util";

export const ApiRouter = Router();

ApiRouter.use(RESTMiddleware);
ApiRouter.use(TokenParseMiddleware);

ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/user", UsersRouter);
ApiRouter.use("/group", GroupsRouter);
