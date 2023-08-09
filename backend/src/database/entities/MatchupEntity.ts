import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SleeperRosterEntity } from './SleeperRosterEntity';

@Entity()
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

}
