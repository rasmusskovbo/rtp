import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Unique
} from "typeorm";
import { PlayerEntity } from "./PlayerEntity";

@Entity("roster")
@Unique(["owner_id"])
export class SleeperRosterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    owner_id!: string;

    @Column()
    league_id!: string;

    @Column()
    roster_id!: number;

    @Column("json")
    settings!: {
        wins: number;
        waiver_position: number;
        waiver_budget_used: number;
        total_moves: number;
        ties: number;
        losses: number;
        fpts_decimal: number;
        fpts_against_decimal: number;
        fpts_against: number;
        fpts: number;
    };


    @OneToMany(() => PlayerEntity, (player) => player.starters, {
        cascade: true,
    })
    starters!: PlayerEntity[];

    @OneToMany(() => PlayerEntity, (player) => player.players, {
        cascade: true,
    })
    players!: PlayerEntity[];

    @OneToMany(() => PlayerEntity, (player) => player.reserve, {
        cascade: true,
    })
    reserve!: PlayerEntity[];

}
