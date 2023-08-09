import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { TeamEntity } from "./TeamEntity"; // Replace with the correct path to your TeamEntity file

@Entity()
export class RivalEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => TeamEntity, team => team.id)
    @JoinColumn()
    owner!: TeamEntity;

    @ManyToOne(() => TeamEntity, team => team.id)
    @JoinColumn()
    rivalTeam!: TeamEntity;

    @Column()
    wins!: number;

    @Column()
    losses!: number;

    @Column()
    fpts!: string;

    @Column()
    fptsAgainst!: string;
}
