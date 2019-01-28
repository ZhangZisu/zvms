import { ChanceType } from "../../entity/chance";
import { User, UserRoles } from "../../entity/user";

export const canOperate = (a: User, b: User, t: ChanceType) => {
    if (a.role >= UserRoles.Manager) { return true; }
    if (a.role >= UserRoles.Secretary && (a.groupId === b.groupId)) { return true; }
    if (t === ChanceType.Public && (a.id === b.id)) { return true; }
    return false;
};
