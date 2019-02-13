import { MinLength, validate } from "class-validator";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chance } from "./chance";
import { User } from "./user";

@Entity()
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    // 班级名称
    @Column() @MinLength(1)
    public name: string;

    // 下属用户
    @OneToMany(() => User, (user) => user.group)
    public users: User[];

    // 下属义工机会
    @OneToMany(() => Chance, (chance) => chance.group)
    public chances: Chance[];

    @BeforeInsert() @BeforeUpdate()
    public async validate() {
        const errors = await validate(this);
        if (errors.length > 0) { throw new Error("Validation failed"); }
    }
}
