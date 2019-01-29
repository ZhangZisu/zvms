import { Max, Min, MinLength } from "class-validator";
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DEF_DESCRIPTION } from "../constant";
import { Chance } from "./chance";
import { Member } from "./member";
import { Team } from "./team";
import { User } from "./user";

export enum ActivityState {
    PendingApprove,
    Approved,
    Registration,
    PendingVerify,
    Finished,
}

@Entity()
export class Activity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 活动名称
    @Column() @MinLength(1)
    public name: string;

    // 活动描述
    @Column("text")
    public description: string = DEF_DESCRIPTION;

    // 活动状态
    @Column() @Min(0) @Max(4)
    public state: ActivityState = ActivityState.PendingApprove;

    // 是否计算过贡献
    @Column()
    public isComputed: boolean = false;

    // 拥有者
    @Column({ nullable: false })
    public ownerId: number;
    @OneToOne(() => User) @JoinColumn()
    public owner: User;

    // 活动报名分配
    @OneToMany(() => Chance, (chance) => chance.activity)
    public chances: Chance[];

    // 活动下属小队
    @OneToMany(() => Team, (team) => team.activity)
    public teams: Team[];

    // 活动下属成员
    @OneToMany(() => Member, (member) => member.activity)
    public members: Member[];
}
