import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";
import {ISleeperUser} from "./ISleeperUser";

@Entity("all_time_winners")
export class AllTimeWinnersEntity implements ISleeperUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100})
    sleeper_username!: string;

    @Column({type: "int"})
    wins!: number;

    @Column({type: "int"})
    second_place!: number;

    @Column({type: "int"})
    third_place!: number;

    @Column({type: "int"})
    playoff_appearances!: number;

    @Column({type: "int"})
    toilet_wins!: number;

    @Column({type: "int"})
    pinks!: number;

    @Column({type: "int", nullable: true})
    user_id!: number | null;
}
