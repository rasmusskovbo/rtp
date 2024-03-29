import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { SleeperRosterEntity } from './SleeperRosterEntity';

@Entity()
@Unique(["week", "matchup_id"])
export class MatchupEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    matchup_id!: number;

    @Column({ type: 'int' })
    week!: number;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.id)
    @JoinColumn({ name: 'home_team_id' })
    home_team!: SleeperRosterEntity | null;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.id)
    @JoinColumn({ name: 'away_team_id' })
    away_team!: SleeperRosterEntity | null;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.id, { nullable: true })
    @JoinColumn({ name: 'winner_id'})
    winner!: SleeperRosterEntity | null;

    @Column({ type: 'float', nullable: true })
    home_team_points!: number | null;

    @Column({ type: 'float', nullable: true })
    away_team_points!: number | null;
}
