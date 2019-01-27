import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chance } from "./chance";
import { Detail } from "./detail";

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public name: string;
    @Column()
    public description: string;
    @OneToMany(() => Chance, (chance) => chance.activity)
    public chances: Chance[];
    @OneToMany(() => Detail, (detail) => detail.activity)
    public details: Detail[];
}
