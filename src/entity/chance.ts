import { Max, Min } from "class-validator";
import { BaseEntity, Column, Entity, Index, ManyToOne, MinKey, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Group } from "./group";

export enum ChanceType {
    // 公开报名
    // 每个人可选创建team或加入team
    Public,
    // 非公开报名
    // 由团支书钦点
    Private,
}

@Entity()
@Index(["activityId", "groupId"])
export class Chance extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 容量
    @Column()
    @Min(1)
    public quota: number;

    // 是否允许学生自由报名
    // 默认：非公开
    @Column()
    @Min(0)
    @Max(1)
    public type: ChanceType = ChanceType.Private;

    // 对应用户组
    @Column({ nullable: false })
    public groupId: number;
    @ManyToOne(() => Group, (group) => group.chances)
    public group: Group;

    // 对应活动
    @Column({ nullable: false })
    public activityId: number;
    @ManyToOne(() => Activity, (activity) => activity.chances)
    public activity: Activity;
}
