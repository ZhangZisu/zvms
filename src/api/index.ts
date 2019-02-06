import { Router } from "express";
import { ActivitiesRouter } from "./activities";
import { AuthRouter } from "./auth";
import { ChancesRouter } from "./chances";
import { GroupsRouter } from "./groups";
import { MediasRouter } from "./medias";
import { MembersRouter } from "./members";
import { TeamsRouter } from "./teams";
import { UsersRouter } from "./users";
import { ApplyREST, ParseToken } from "./util";

export const ApiRouter = Router();

ApiRouter.use(ApplyREST);
ApiRouter.use(ParseToken);

ApiRouter.use("/activities", ActivitiesRouter);
ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/chances", ChancesRouter);
ApiRouter.use("/groups", GroupsRouter);
ApiRouter.use("/medias", MediasRouter);
ApiRouter.use("/members", MembersRouter);
ApiRouter.use("/teams", TeamsRouter);
ApiRouter.use("/users", UsersRouter);
