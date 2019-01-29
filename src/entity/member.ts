import { Max, Min } from "class-validator";
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Team } from "./team";
import { User } from "./user";

export enum ReviewResult {
    Pending,
    Approved,
    Failed,
}

@Entity()
@Index(["userId", "activityId"], { unique: true })
export class Member extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 义工相关信息
    // 内部义工时间计数
    @Column()
    public iTime: number = 0;
    // 外部义工时间计数
    @Column()
    public oTime: number = 0;
    // 万能义工时间计数
    @Column()
    public uTime: number = 0;
    // 小组长评价
    @Column("text")
    public comment: string;
    // 小组长审核
    @Column() @Min(0) @Max(2)
    public leaderReview: ReviewResult = ReviewResult.Pending;
    // 学生会审核
    @Column() @Min(0) @Max(2)
    public managerReview: ReviewResult = ReviewResult.Pending;
    // 管理员审核
    @Column() @Min(0) @Max(2)
    public administratorReview: ReviewResult = ReviewResult.Pending;

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
}
