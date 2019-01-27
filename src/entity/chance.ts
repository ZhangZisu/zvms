import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Group } from "./group";

@Entity()
export class Chance {
    @PrimaryGeneratedColumn()
    public id: number;
    // 容量
    @Column()
    public quota: number;
    // 是否允许学生自由报名
    @Column()
    public public: boolean;
    // 对应用户组
    @ManyToOne(() => Group, (group) => group.chances)
    public group: Group;
    // 对应活动
    @ManyToOne(() => Activity, (activity) => activity.chances)
    public activity: Activity;
}
