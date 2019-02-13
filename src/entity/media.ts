import { MinLength, validate } from "class-validator";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";
import { Member } from "./member";
import { User } from "./user";

@Entity()
export class Media extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column() @MinLength(1)
    public name: string;

    @Column() @MinLength(1)
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

    // 用户相册
    @Column({ nullable: false })
    public userId: number;
    @ManyToOne(() => User, (user) => user.medias)
    public user: User;

    @BeforeInsert() @BeforeUpdate()
    public async validate() {
        const errors = await validate(this);
        if (errors.length > 0) { throw new Error("Validation failed"); }
    }
}
