import { IsBoolean, IsInt, Max, Min, MinLength, validate } from "class-validator";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DEF_COMMENT } from "../constant";
import { Activity } from "./activity";
import { Media } from "./media";
import { Team } from "./team";
import { User } from "./user";

@Entity() @Index(["userId", "activityId"], { unique: true })
export class Member extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 义工相关信息
    // 内部义工时间计数
    @Column() @IsInt() @Min(0)
    public iTime: number = 0;
    // 外部义工时间计数
    @Column() @IsInt() @Min(0)
    public oTime: number = 0;
    // 万能义工时间计数
    @Column() @IsInt() @Min(0)
    public uTime: number = 0;
    // 小组长评价
    @Column("text") @MinLength(1)
    public comment: string = DEF_COMMENT;
    // 小组长审核
    @Column() @IsBoolean()
    public isLeaderApproved: boolean = false;
    // 学生会审核
    @Column() @IsBoolean()
    public isManagerApproved: boolean = false;
    // 管理员审核
    @Column() @IsBoolean()
    public isAdminApproved: boolean = false;

    // 对应用户
    @Column({ nullable: false })
    public userId: number;
    @ManyToOne(() => User, (user) => user.history)
    public user: User;

    // 对应小队
    @Column({ nullable: false })
    public teamId: number;
    @ManyToOne(() => Team, (team) => team.members)
    public team: Team;

    // 对应活动
    @Column({ nullable: false })
    public activityId: number;
    @ManyToOne(() => Activity, (activity) => activity.members)
    public activity: Activity;

    // 下属媒体资料
    @OneToMany(() => Media, (media) => media.member)
    public medias: Media[];

    @BeforeInsert() @BeforeUpdate()
    public async validate() {
        const errors = await validate(this);
        if (errors.length > 0) { throw new Error("Validation failed"); }
    }
}
