import { IsEmail, Max, Min, MinLength } from "class-validator";
import { pbkdf2Sync, randomBytes } from "crypto";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group";
import { Member } from "./member";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 用户名
    @Column()
    @MinLength(1)
    public name: string;

    // 邮箱
    @Column()
    @IsEmail()
    public email: string;

    // 密码散列
    @Column({ select: false })
    public hash: string;
    // 密码盐
    @Column({ select: false })
    public salt: string;

    // 用户角色
    @Column()
    public isSecretary: boolean = false;
    @Column()
    public isManager: boolean = false;
    @Column()
    public isAdministrator: boolean = false;
    @Column()
    public isProvider: boolean = false;

    // 内部义工时间计数
    @Column()
    public iTime: number = 0;
    // 外部义工时间计数
    @Column()
    public oTime: number = 0;
    // 万能义工时间计数
    @Column()
    public uTime: number = 0;

    @Column()
    public removed: boolean = false;

    // 所属用户组
    @Column()
    public groupId: number;
    @ManyToOne(() => Group, (group) => group.users)
    public group: Group;

    // 义工历史
    @OneToMany(() => Member, (member) => member.user)
    public history: Member[];

    public setPassword(password: string) {
        this.salt = randomBytes(16).toString("hex");
        this.hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    }
    public verifyPassword(password: string) {
        const hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
        return this.hash === hash;
    }
}
