import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Team } from "./team";
import { User } from "./user";

@Entity()
export class Member {
    @PrimaryGeneratedColumn()
    public id: number;

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
