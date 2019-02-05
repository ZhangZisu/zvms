import { Router } from "express";
import { ActivitiesRouter } from "./activities";
import { AuthRouter } from "./auth";
import { GroupsRouter } from "./groups";
import { UsersRouter } from "./users";
import { ApplyREST, ParseToken } from "./util";

export const ApiRouter = Router();

ApiRouter.use(ApplyREST);
ApiRouter.use(ParseToken);

ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/users", UsersRouter);
ApiRouter.use("/groups", GroupsRouter);
ApiRouter.use("/activities", ActivitiesRouter);
