import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";
import {ISleeperUser} from "./ISleeperUser";

@Entity("all_time_standings")
export class AllTimeStandingsEntity implements ISleeperUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100})
    sleeper_username!: string;

    @Column({type: "varchar", length: 100})
    record!: string;

    @Column({type: "int"})
    win_p!: number;

    @Column({type: "int"})
    pf!: number;

    @Column({type: "int"})
    pa!: number;

    @Column({type: "int"})
    diff!: number;

    @Column({type: "int"})
    trans!: number;

    @Column({type: "int"})
    msgs!: number;

    @Column({type: "int", nullable: true})
    user_id!: number | null;
}
