import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getManager } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_UNKNOW, SEC_SECRET } from "../constant";
import { User } from "../entity/user";

export type RESTResponse = Response & {
    RESTSend(value: any): void;
    RESTFail(message: any): void;
    RESTEnd(): void;
};

export type RESTRequest = Request & {
    userId?: number;
    user?: User;
};

export enum RESTState {
    succeeded,
    failed,
}

export const Wrap = (handle: (req: RESTRequest, res: RESTResponse, next?: NextFunction) => Promise<void> | void) => {
    return async (req: RESTRequest, res: RESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            return res.RESTFail(e.message);
        }
    };
};

export const RESTMiddleware = (req: RESTRequest, res: RESTResponse, next: NextFunction) => {
    res.RESTSend = (value: any) => {
        res.json({ s: RESTState.succeeded, p: value });
    };
    res.RESTFail = (message: any) => {
        res.json({ s: RESTState.failed, p: message });
    };
    res.RESTEnd = () => {
        res.json({ s: RESTState.succeeded });
    };
    return next();
};

export const ensure = (expression: any, message: string = ERR_UNKNOW) => {
    if (!expression) { throw new Error(message); }
};

export const TokenParseMiddleware = Wrap((req, res, next) => {
    const token = req.headers["x-access-token"] || (req.body && req.body.access_token) || (req.query && req.query.access_token);
    if (token) {
        const decoded = verify(token, SEC_SECRET) as any;
        req.userId = decoded.id;
    }
    return next();
});

export const LoadUserMiddleware = Wrap(async (req, res, next) => {
    ensure(req.userId, ERR_ACCESS_DENIED);
    ensure(req.user = await getManager().getRepository(User).findOne(req.userId), ERR_ACCESS_DENIED);
    return next();
});
