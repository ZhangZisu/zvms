import { IsBoolean, IsEmail, IsInt, Max, Min, MinLength, validate } from "class-validator";
import { pbkdf2Sync, randomBytes } from "crypto";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DEF_DESCRIPTION } from "../constant";
import { Group } from "./group";
import { Media } from "./media";
import { Member } from "./member";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 用户名
    @Column({ unique: true }) @MinLength(1)
    public name: string;

    // 邮箱
    @Column({ unique: true }) @IsEmail()
    public email: string;

    // 描述
    @Column("text") @MinLength(1)
    public description: string = DEF_DESCRIPTION;

    // 密码散列
    @Column({ select: false })
    public hash: string;
    // 密码盐
    @Column({ select: false })
    public salt: string;

    // 用户角色
    @Column() @IsBoolean()
    public isSecretary: boolean = false;
    @Column() @IsBoolean()
    public isManager: boolean = false;
    @Column() @IsBoolean()
    public isAdmin: boolean = false;
    @Column() @IsBoolean()
    public isProvider: boolean = false;

    // 内部义工时间计数
    @Column() @IsInt() @Min(0)
    public iTime: number = 0;
    // 外部义工时间计数
    @Column() @IsInt() @Min(0)
    public oTime: number = 0;
    // 万能义工时间计数
    @Column() @IsInt() @Min(0)
    public uTime: number = 0;

    // 逻辑删除
    @Column() @IsBoolean()
    public isRemoved: boolean = false;

    // 所属用户组
    @Column()
    public groupId: number;
    @ManyToOne(() => Group, (group) => group.users)
    public group: Group;

    // 义工历史
    @OneToMany(() => Member, (member) => member.user)
    public history: Member[];

    // 所属媒体资源
    @OneToMany(() => Media, (media) => media.user)
    public medias: Media[];

    @BeforeInsert() @BeforeUpdate()
    public async validate() {
        const errors = await validate(this);
        if (errors.length > 0) { throw new Error("Validation failed"); }
    }

    public setPassword(password: string) {
        this.salt = randomBytes(16).toString("hex");
        this.hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    }
    public verifyPassword(password: string) {
        const hash = pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
        return this.hash === hash;
    }
}
