import { pbkdf2Sync, randomBytes } from "crypto";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group";

export enum UserRoles {
    CommonUser,
    Secretary,
    Manager,
    Administrator,
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id: number;
    // 用户名
    @Column()
    public name: string;
    // 邮箱
    @Column()
    public email: string;
    // 密码散列
    @Column({ select: false })
    public hash: string;
    // 密码盐
    @Column({ select: false })
    public salt: string;
    // 用户角色
    @Column()
    public role: UserRoles = UserRoles.CommonUser;
    // 内部义工时间计数
    @Column()
    public innerTimeCount: number = 0;
    // 外部义工时间计数
    @Column()
    public outerTimCount: number = 0;
    // 所属用户组
    @ManyToOne(() => Group, (group) => group.users)
    public group: Group;

    public setPassword(password: string) {
        this.salt = randomBytes(16).toString("hex");
        this.hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    }
    public verifyPassword(password: string) {
        const hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
        return this.hash === hash;
    }
}
