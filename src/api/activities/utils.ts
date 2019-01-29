import { ChanceType } from "../../entity/chance";
import { User } from "../../entity/user";

// 注册期权限判断
export const canOperateDuringReg = (a: User, b: User, t: ChanceType) => {
    if (a.isManager || a.isAdministrator) { return true; }
    if (a.isSecretary && (a.groupId === b.groupId)) { return true; }
    if (t === ChanceType.Public && (a.id === b.id)) { return true; }
    return false;
};
