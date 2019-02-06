import { Min } from "class-validator";
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Group } from "./group";

@Entity() @Index(["activityId", "groupId"], { unique: true })
export class Chance extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 容量
    @Column() @Min(1)
    public quota: number;

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
