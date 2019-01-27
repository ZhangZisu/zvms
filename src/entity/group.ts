import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chance } from "./chance";
import { User } from "./user";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    public id: number;
    // 用户组名
    @Column()
    public name: string;
    // 所有用户
    @OneToMany(() => User, (user) => user.group)
    public users: User[];
    // 所有义工事件
    @OneToMany(() => Chance, (chance) => chance.group)
    public chances: Chance[];
}
