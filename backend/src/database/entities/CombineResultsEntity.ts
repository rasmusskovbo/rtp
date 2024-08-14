import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";
import {ISleeperUser} from "./ISleeperUser";

@Entity("combine_results")
export class CombineResultsEntity implements ISleeperUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100})
    sleeper_username!: string;

    @Column({type: "int"})
    total_picks_votes!: number;

    @Column({type: "int"})
    total_correct_picks!: number;

    @Column({type: "float"})
    flip_cup_time!: number;

    @Column({ type: "int", default: 0 })
    beer_pong_score!: number;

    @Column({type: "int"})
    grid_score!: number;

    @Column({type: "float"})
    sprint_time!: number;

    @Column({type: "int"})
    football_goal_hits!: number;

    @Column({type: "int"})
    total_push_ups!: number;

    @Column({type: "int"})
    football_bucket_hits!: number;

    @Column({type: "float"})
    total_combine_score!: number;

    @Column({type: "int"})
    year!: number;
}
