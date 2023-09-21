import {getRepository} from "typeorm";
import {MatchupEntity} from "../database/entities/MatchupEntity";
import {VoteEntity} from "../database/entities/VoteEntity";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {DateTime} from 'luxon';
import {TeamEntity} from "../database/entities/TeamEntity";
import {UserEntity} from "../database/entities/UserEntity";
import {PicksStatisticsModel} from "../models/PicksStatisticsModel";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {upsertAndMapMatchupsForWeek} from "./MatchupsService";

interface PicksLeaderboardEntry {
    username: string;
    correctPicks: number;
    totalVotes: number;
}

export interface VoteLockoutDetails {
    date: DateTime;
    isVoteLockedOut: boolean;
}

// Should only be run once weekly matchups are over, and points will not be changed.
export async function updateWinnersForMatchups(week: number) {
    const matchupRepository = getRepository(MatchupEntity);

    // Update points for all matchups first
    await upsertAndMapMatchupsForWeek(week);

    // Fetch all matchups or filter based on your criteria
    const matchups = await matchupRepository.find({
        where: { week: week},
        relations: ['home_team', 'away_team']
    });

    // Iterate through matchups and determine the winner
    for (const matchup of matchups) {
        console.log("Determining winner for matchup with ID: " + matchup.id)
        if (matchup.home_team_points !== null && matchup.away_team_points !== null) {
            if (matchup.home_team_points > matchup.away_team_points) {
                matchup.winner = matchup.home_team;
            } else if (matchup.home_team_points < matchup.away_team_points) {
                matchup.winner = matchup.away_team;
            } else {
                // Handle the tie scenario if necessary. If its a tie, both picks lose.
                matchup.winner = null;
            }
            // Save the updated matchup
            await matchupRepository.save(matchup);
        }
    }
}

export async function processVotesForMatchupsForWeek(week: number) {
    const matchupRepository = getRepository(MatchupEntity);
    const voteRepository = getRepository(VoteEntity);

    // Fetch all matchups
    const matchups = await matchupRepository.find({
        where: { week: week},
        relations: ['winner']
    });

    // Iterate through each matchup
    for (const matchup of matchups) {
        console.log("Processing votes for matchup with ID: " + matchup.id)
        // Fetch votes for the current matchup
        const votes = await voteRepository.find({
            where: { matchup: {id: matchup.id}},
            relations: ['roster']
        });

        // Iterate through each vote
        for (const vote of votes) {
            if (matchup.winner) {
                // vote was correct if IDs match
                vote.voteCorrect = vote.roster.id === matchup.winner.id;
            } else {
                vote.voteCorrect = false; // False if winner is null (i.e. it was a tie)
            }

            // Update the vote in the database
            await voteRepository.save(vote);
        }
    }
}

export async function getPicksLeaderboard(): Promise<PicksLeaderboardEntry[]> {
    console.log("Fetching total picks count from database...")
    const voteRepository = getRepository(VoteEntity);

    const correctPicks = await voteRepository
        .createQueryBuilder('vote')
        .innerJoinAndSelect('vote.user', 'user')
        .select(['user.username'])
        .addSelect('SUM(CASE WHEN vote.voteCorrect THEN 1 ELSE 0 END)', 'correctpickscount')
        .addSelect('COUNT(vote.id)', 'totalvotes')
        .groupBy('user.username')
        .orderBy('correctpickscount', 'DESC')
        .addOrderBy('totalvotes', 'DESC')
        .getRawMany();

    console.log("Mapping and returning total picks count...")
    return correctPicks.map(pick => ({
        username: pick.user_username,
        correctPicks: Number(pick.correctpickscount),
        totalVotes: Number(pick.totalvotes),
    }));
}

export async function getVoteLockoutDetails(): Promise<VoteLockoutDetails> {
    // Fetch the current week entity from the database
    const currentWeekEntity = await getRepository(CurrentWeekEntity).find();

    if (!currentWeekEntity) {
        throw new Error("No current week found in database");
    }

    const currentWeek = currentWeekEntity[0]

    if (currentWeek.voteLockedOut) {
        // If the vote is locked out, find the next Wednesday at 05:00 UTC
        const nextWed = DateTime.now().setZone('UTC').plus({ days: (3 - DateTime.now().weekday + 7) % 7 }).set({ hour: 5, minute: 0, second: 0, millisecond: 0 });
        return { date: nextWed, isVoteLockedOut: true };
    } else {
        // If the vote is not locked out, find the next Thursday at 21:00 UTC
        const nextThu = DateTime.now().setZone('UTC').plus({ days: (4 - DateTime.now().weekday + 7) % 7 }).set({ hour: 21, minute: 0, second: 0, millisecond: 0 });
        return { date: nextThu, isVoteLockedOut: false };
    }

}

export async function getVoteLockoutDetailsForWeek(week: number): Promise<VoteLockoutDetails> {
    // Fetch the current week entity from the database
    const currentWeekEntity = await getRepository(CurrentWeekEntity).find();

    if (!currentWeekEntity) {
        throw new Error("No current week found in database");
    }

    const currentWeek = currentWeekEntity[0]

    if (currentWeek.weekNumber > week) {
        // If querying for a non current week, vote is locked out.
        return { date: DateTime.now(), isVoteLockedOut: true };
    }

    if (currentWeek.voteLockedOut) {
        // If the vote is locked out, find the next Wednesday at 05:00 UTC
        const nextWed = DateTime.now().setZone('UTC').plus({ days: (3 - DateTime.now().weekday + 7) % 7 }).set({ hour: 5, minute: 0, second: 0, millisecond: 0 });
        return { date: nextWed, isVoteLockedOut: true };
    } else {
        // If the vote is not locked out, find the next Thursday at 21:00 UTC
        const nextThu = DateTime.now().setZone('UTC').plus({ days: (4 - DateTime.now().weekday + 7) % 7 }).set({ hour: 21, minute: 0, second: 0, millisecond: 0 });
        return { date: nextThu, isVoteLockedOut: false };
    }

}

/** AWARD CARDS **/
export async function getPicksStatistics(): Promise<PicksStatisticsModel> {
    console.log("Fetching picks statistics...")
    const [
        teamWithLeastVotes,
        teamWithMostVotes,
        teamWithLeastVotesMostWins,
        teamWithMostVotesLeastWins,
        userWithMostVotes,
        userWithLeastVotes
    ] = await Promise.all([
        getTeamWithLeastVotes(),
        getTeamWithMostVotes(),
        getLeastVotedTopWinningTeam(),
        getMostVotedLeastWinningTeam(),
        getUserWithMostVotes(),
        getUserWithLeastVotes()
    ]);

    console.log("Returning picks statistics.")
    return {
        teamWithLeastVotes,
        teamWithMostVotes,
        teamWithLeastVotesMostWins,
        teamWithMostVotesLeastWins,
        userWithMostVotes,
        userWithLeastVotes
    };
}


async function getTeamWithLeastVotes(): Promise<TeamEntity | null> {
    const teamRepository = getRepository(TeamEntity);
    const team = await teamRepository
        .createQueryBuilder('team')
        .leftJoin('team.roster', 'roster')
        .leftJoin(VoteEntity, 'vote', 'vote.rosterId = roster.id')
        .groupBy('team.id')
        .orderBy('COUNT(vote.id)', 'ASC')
        .getOne();

    return team;
}

async function getTeamWithMostVotes(): Promise<TeamEntity | null> {
    const teamRepository = getRepository(TeamEntity);
    const team = await teamRepository
        .createQueryBuilder('team')
        .leftJoin('team.roster', 'roster')
        .leftJoin(VoteEntity, 'vote', 'vote.rosterId = roster.id')
        .groupBy('team.id')
        .orderBy('COUNT(vote.id)', 'DESC')
        .getOne();

    return team;
}

async function getUserWithMostVotes(): Promise<string | undefined> {
    const userRepository = getRepository(UserEntity);
    const user = await userRepository
        .createQueryBuilder('user')
        .leftJoin(VoteEntity, 'vote', 'vote.userId = user.id')
        .groupBy('user.id')
        .orderBy('COUNT(vote.id)', 'DESC')
        .getOne();

    return user?.username;
}

async function getUserWithLeastVotes(): Promise<string | undefined> {
    const userRepository = getRepository(UserEntity);
    const user = await userRepository
        .createQueryBuilder('user')
        .leftJoin(VoteEntity, 'vote', 'vote.userId = user.id')
        .groupBy('user.id')
        .orderBy('COUNT(vote.id)', 'ASC')
        .getOne();

    return user?.username;
}

// for every matchup this team won but didnt get a vote -> 1 point in determining whether its the team returned
async function getLeastVotedTopWinningTeam(): Promise<TeamEntity | null> {
    const rosters = await getRepository(SleeperRosterEntity).find({ relations: ['team'] });
    const scores: Map<number, number> = new Map();

    for (const roster of rosters) {
        let score = 0;

        const matchupsWon = await getRepository(MatchupEntity).find({
            where: { winner: { id: roster.id} },
        });

        for (const matchup of matchupsWon) {
            const totalVotes = await getRepository(VoteEntity).count({
                where: { matchup: { id: matchup.id }
            }});
            const votesForRoster = await getRepository(VoteEntity).count({
                where: {
                    matchup: { id: matchup.id},
                    roster: { id: roster.id }
                }
            });

            if (votesForRoster < totalVotes / 2) {
                score += 1;
            }
        }

        scores.set(roster.id, score);
    }

    // Find the roster with the maximum score
    let maxScore = 0;
    let bestRosterId: number | undefined;

    scores.forEach((score, rosterId) => {
        if (score > maxScore) {
            maxScore = score;
            bestRosterId = rosterId;
        }
    });

    if (bestRosterId !== undefined) {
        const bestRoster = rosters.find(roster => roster.id === bestRosterId);
        return bestRoster!.team;
    }

    return null;
}

async function getMostVotedLeastWinningTeam(): Promise<TeamEntity | null> {
    const rosters = await getRepository(SleeperRosterEntity).find({ relations: ['team'] });
    const scores: Map<number, number> = new Map();
    const wins: Map<number, number> = new Map();

    for (const roster of rosters) {
        let score = 0;

        const matchupsParticipated = await getRepository(MatchupEntity).find({
            where: [
                { home_team: { id: roster.id } },
                { away_team: { id: roster.id } }
            ]
        });

        for (const matchup of matchupsParticipated) {
            const totalVotes = await getRepository(VoteEntity).count({ where: { matchup: { id: matchup.id } } });
            const votesForRoster = await getRepository(VoteEntity).count({
                where: {
                    matchup: { id: matchup.id },
                    roster: { id: roster.id }
                }
            });

            if (matchup.winner
                && matchup.winner.id !== roster.id
                && votesForRoster > totalVotes / 2) {
                score += 1;
            }
        }

        const matchupsWon = await getRepository(MatchupEntity).find({ where: { winner: { id: roster.id } } });
        wins.set(roster.id, matchupsWon.length);
        scores.set(roster.id, score);
    }

    // Find the roster with the minimum wins and maximum score
    let minWins = Infinity;
    let maxScore = 0;
    let bestRosterId: number | undefined;

    scores.forEach((score, rosterId) => {
        const rosterWins = wins.get(rosterId) || Infinity;
        if (rosterWins < minWins || (rosterWins === minWins && score > maxScore)) {
            minWins = rosterWins;
            maxScore = score;
            bestRosterId = rosterId;
        }
    });

    if (bestRosterId !== undefined) {
        const bestRoster = rosters.find(roster => roster.id === bestRosterId);
        return bestRoster!.team;
    }

    return null;
}

