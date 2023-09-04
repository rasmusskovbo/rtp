import {TeamEntity} from "../database/entities/TeamEntity";

export interface PicksStatisticsModel {
    teamWithLeastVotes: TeamEntity | null;
    teamWithMostVotes: TeamEntity | null;
    //teamWithLeastVotesMostWins: TeamEntity | null;
    //teamWithMostVotesLeastWins: TeamEntity | null;
    userWithMostVotes: string | undefined;
    userWithLeastVotes: string | undefined;
}
