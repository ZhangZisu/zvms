import { User } from "../../entity/user";

// 注册期权限判断
// 公开报名：任何人可以创建自己，团支书可以创建本班的人，管理员可以创建所有人
// 非公开报名：团支书可以创建本班的人，管理员可以创建所有人
export const canOperateDuringReg = (a: User, b: User, isPublic: boolean) => {
    if (a.isManager || a.isAdministrator) { return true; }
    if (a.isSecretary && (a.groupId === b.groupId)) { return true; }
    if (isPublic && (a.id === b.id)) { return true; }
    return false;
};
