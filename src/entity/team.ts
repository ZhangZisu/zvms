import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Member } from "./member";
import { User } from "./user";

@Entity()
@Index(["leaderId", "activityId"], { unique: true })
export class Team extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 小组长
    @Column({ nullable: false })
    public leaderId: number;
    @OneToOne(() => User)
    @JoinColumn()
    public leader: User;

    // 对应活动
    @Column({ nullable: false })
    public activityId: number;
    @ManyToOne(() => Activity, (activity) => activity.teams)
    public activity: Activity;

    // 下属成员
    @OneToMany(() => Member, (member) => member.team)
    public members: Member[];
}
