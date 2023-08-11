import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Unique,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { SleeperRosterEntity } from './SleeperRosterEntity';
import { MatchupEntity } from './MatchupEntity';

@Entity('votes')
@Unique(['user', 'matchup'])
export class VoteEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // The matchup the user voted on
    @ManyToOne(() => MatchupEntity)
    matchup!: MatchupEntity;

    // The user who submitted this vote
    @ManyToOne(() => UserEntity)
    user!: UserEntity;

    // The roster in the matchup the user voted for
    @ManyToOne(() => SleeperRosterEntity)
    roster!: SleeperRosterEntity;

}
