import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { FindManyOptions, Like } from "typeorm";
import { ERR_ACCESS_DENIED, ERR_BAD_REQUEST, ERR_UNKNOW, LIM_PAGINATION_ITEMS, SEC_SECRET } from "../constant";
import { User } from "../entity/user";
import { verbose } from "../log";

export type RESTResponse = Response & {
    RESTSend(value: any): void;
    RESTFail(message: any): void;
    RESTEnd(): void;
};

export type RESTRequest = Request & {
    userId?: number;
    user?: User;
    pagination?: FindManyOptions;
};

export enum ResponseState {
    succeeded,
    failed,
}

export const Wrap = (handle: (req: RESTRequest, res: RESTResponse, next?: NextFunction) => Promise<void> | void) => {
    return async (req: RESTRequest, res: RESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            verbose(e.message);
            return res.RESTFail(e.message);
        }
    };
};

export const ApplyREST = (req: RESTRequest, res: RESTResponse, next: NextFunction) => {
    res.RESTSend = (value: any) => {
        res.json({ s: ResponseState.succeeded, p: value });
    };
    res.RESTFail = (message: any) => {
        res.json({ s: ResponseState.failed, p: message });
    };
    res.RESTEnd = () => {
        res.json({ s: ResponseState.succeeded });
    };
    return next();
};

export const ensure = (expression: any, message: string = ERR_UNKNOW) => {
    if (!expression) { throw new Error(message); }
};

export const ParseToken = Wrap((req, res, next) => {
    const token = req.headers["x-access-token"] || (req.body && req.body.access_token) || (req.query && req.query.access_token);
    if (token) {
        const decoded = verify(token, SEC_SECRET) as any;
        req.userId = decoded.id;
    }
    return next();
});

export const LoadUser = Wrap(async (req, res, next) => {
    ensure(req.userId, ERR_ACCESS_DENIED);
    ensure(req.user = await User.findOne(req.userId), ERR_ACCESS_DENIED);
    return next();
});

export const LoadPagination = Wrap(async (req, res, next) => {
    // tslint:disable-next-line:prefer-const
    let { sortBy, descending, page, rowsPerPage, search } = req.query;
    page = parseInt(page, 10);
    ensure(page > 0, ERR_BAD_REQUEST);
    rowsPerPage = parseInt(rowsPerPage, 10);
    ensure(rowsPerPage > 0 && rowsPerPage <= LIM_PAGINATION_ITEMS, ERR_BAD_REQUEST);
    req.pagination = {};
    req.pagination.skip = (page - 1) * rowsPerPage;
    req.pagination.take = rowsPerPage;
    if (typeof sortBy === "string" && sortBy) {
        req.pagination.order = { [sortBy]: !!descending ? "DESC" : "ASC" };
    }
    if (typeof search === "string" && search) {
        req.pagination.where = {
            name: Like(`%${req.query.search}%`),
        };
    }
    return next();
});

// 注册期权限判断
// 公开报名：任何人可以创建自己，团支书可以创建本班的人，管理员可以创建所有人
// 非公开报名：团支书可以创建本班的人，管理员可以创建所有人
export const canOperateDuringReg = (a: User, b: User, isPublic: boolean) => {
    if (a.isManager || a.isAdmin) { return true; }
    if (a.isSecretary && (a.groupId === b.groupId)) { return true; }
    if (isPublic && (a.id === b.id)) { return true; }
    return false;
};
