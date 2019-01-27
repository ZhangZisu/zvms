import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity";

export enum DetailApproveStatus {
    Pending,
    Approved,
    Invalid,
}

@Entity()
export class Detail {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public reward: number;
    @Column("text")
    public comment: string;
    // @Column()
    // leaderOpinion:
    @ManyToOne(() => Activity, (activity) => activity.details)
    public activity: Activity;
}
