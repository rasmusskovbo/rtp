import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";
import {ISleeperUser} from "./ISleeperUser";

@Entity("weekly_highscore")
export class WeeklyHighScoreEntity implements ISleeperUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100})
    sleeper_username!: string;

    @Column({type: "int"})
    score!: number;

    @Column({type: "int"})
    year!: number;

    @Column({type: "int"})
    week!: number;

    @Column({type: "int", nullable: true})
    user_id!: number | null;
}
