import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, MinKey } from "typeorm";
import { Activity } from "./activity";
import { Group } from "./group";
import { Min, Max } from "class-validator";

export enum ChanceType {
    // 公开报名
    // 每个人可选创建team或加入team
    Public,
    // 非公开报名
    // 由团支书钦点
    Private
}

@Entity()
export class Chance {
    @PrimaryGeneratedColumn()
    public id: number;

    // 容量
    @Column()
    public quota: number;

    // 是否允许学生自由报名
    // 默认：非公开
    @Column()
    @Min(0)
    @Max(1)
    public type: ChanceType = ChanceType.Private;

    // 对应用户组
    @ManyToOne(() => Group, (group) => group.chances)
    public group: Group;

    // 对应活动
    @ManyToOne(() => Activity, (activity) => activity.chances)
    public activity: Activity;
}
