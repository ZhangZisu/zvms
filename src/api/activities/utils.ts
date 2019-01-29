import { User } from "../../entity/user";

// 注册期权限判断
export const canOperateDuringReg = (a: User, b: User, isPublic: boolean) => {
    if (a.isManager || a.isAdministrator) { return true; }
    if (a.isSecretary && (a.groupId === b.groupId)) { return true; }
    if (isPublic && (a.id === b.id)) { return true; }
    return false;
};
