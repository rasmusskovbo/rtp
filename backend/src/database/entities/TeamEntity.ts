import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";
import { PlayerEntity } from "./PlayerEntity";

@Entity()
export class TeamEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    ownerId!: string;

    @Column()
    sleeperUsername!: string;

    @Column()
    teamName!: string;

    @Column()
    ownerName!: string;

    @Column()
    teamMascot!: string;

    @Column()
    yearsInLeague!: number;

    @Column()
    bio!: string;

    @Column()
    teamLogo!: string;

    @Column()
    ownerImage!: string;

    // Todo maybe not needed anymrore?
    @OneToMany(() => PlayerEntity, (player) => player.team, {
        cascade: true,
    })
    activeRoster!: PlayerEntity[];
}
