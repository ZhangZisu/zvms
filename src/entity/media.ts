import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Member } from "./member";
import { User } from "./user";

@Entity()
export class Media extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public mimeType: string;

    // 活动-资料库
    @Column({ nullable: false })
    public activityId: number;
    @ManyToOne(() => Activity, (activity) => activity.medias)
    public activity: Activity;

    // 活动-成员-我的资料
    @Column({ nullable: false })
    public memberId: number;
    @ManyToOne(() => Member, (member) => member.medias)
    public member: Member;

    // 用户相册？？？
    @Column({ nullable: false })
    public userId: number;
    @ManyToOne(() => User, (user) => user.medias)
    public user: User;
}
