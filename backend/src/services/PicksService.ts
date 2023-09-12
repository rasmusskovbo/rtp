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
        // If the vote is locked out, find the next Wednesday at 09:00 CET
        const nextWed = DateTime.now().setZone('Europe/Brussels').plus({ days: (3 - DateTime.now().weekday + 7) % 7 }).set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
        return { date: nextWed, isVoteLockedOut: true };
    } else {
        // If the vote is not locked out, find the next Sunday at 17:00 CET
        const nextSun = DateTime.now().setZone('Europe/Brussels').plus({ days: (4 - DateTime.now().weekday + 7) % 7 }).set({ hour: 23, minute: 0, second: 0, millisecond: 0 });
        return { date: nextSun, isVoteLockedOut: false };
    }
}

/** AWARD CARDS **/
export async function getPicksStatistics(): Promise<PicksStatisticsModel> {
    console.log("Fetching picks statistics...")
    const [
        teamWithLeastVotes,
        teamWithMostVotes,
        //teamWithLeastVotesMostWins,
        //teamWithMostVotesLeastWins,
        userWithMostVotes,
        userWithLeastVotes
    ] = await Promise.all([
        getTeamWithLeastVotes(),
        getTeamWithMostVotes(),
        //getLeastVotedTopWinningTeam(),
        //getMostVotedLeastWinningTeam(),
        getUserWithMostVotes(),
        getUserWithLeastVotes()
    ]);

    console.log("Returning picks statistics.")
    return {
        teamWithLeastVotes,
        teamWithMostVotes,
        //teamWithLeastVotesMostWins,
        //teamWithMostVotesLeastWins,
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
    const matchupRepo = getRepository(MatchupEntity);
    const voteRepo = getRepository(VoteEntity);

    // Get the count of all matchup wins for each team
    const winningCounts = await matchupRepo
        .createQueryBuilder("matchup")
        .select("matchup.winner_id", "winnerId") // winner id = roster.id
        .addSelect("COUNT(matchup.id)", "winCount")
        .groupBy("matchup.winner_id")
        .getRawMany();

    // Map of teamId to its winning count
    const winMap = new Map();
    winningCounts.forEach(win => winMap.set(win.winnerId, win.winCount));

    // Get vote counts for each roster in each matchup
    const voteCounts = await voteRepo
        .createQueryBuilder("vote")
        .select("vote.roster.id", "rosterId")
        .addSelect("COUNT(vote.id)", "voteCount")
        .groupBy("vote.roster.id")
        .getRawMany();

    // Map of teamId to its vote count
    const voteMap = new Map();
    voteCounts.forEach(vote => voteMap.set(vote.rosterId, vote.voteCount));

    // Combine the data and sort
    const combinedData = winningCounts.map(win => ({
        teamId: win.winnerId,
        winCount: win.winCount,
        voteCount: voteMap.get(win.winnerId) || 0
    }));

    combinedData.sort((a, b) => b.winCount - a.winCount || a.voteCount - b.voteCount);

    const topResult = combinedData[0];
    if (topResult) {
        const sleeperRosterRepo = getRepository(SleeperRosterEntity);
        const teamRepo = getRepository(TeamEntity);
        const rosterResult = await sleeperRosterRepo.findOne(topResult.teamId);
        return rosterResult ? await teamRepo.findOne({ where: { roster: rosterResult }}) : null;
    } else {
        return null;
    }
}


// for every matchup this team got a vote on, but still lost -> 1 point in the determining whether its returned. team with msot points is returned
async function getMostVotedLeastWinningTeam(): Promise<TeamEntity | null> {
    const matchupRepo = getRepository(MatchupEntity);
    const voteRepo = getRepository(VoteEntity);

    // Get the count of all matchup wins for each team
    const winningCounts = await matchupRepo
        .createQueryBuilder("matchup")
        .select("matchup.winner_id", "winnerId")
        .addSelect("COUNT(matchup.id)", "winCount")
        .groupBy("matchup.winner_id")
        .getRawMany();

    // Map of teamId to its winning count
    const winMap = new Map();
    winningCounts.forEach(win => winMap.set(win.winnerId, win.winCount));

    // Get vote counts for each roster in each matchup
    const voteCounts = await voteRepo
        .createQueryBuilder("vote")
        .select("vote.roster_id", "rosterId")
        .addSelect("COUNT(vote.id)", "voteCount")
        .groupBy("vote.roster_id")
        .getRawMany();

    // Map of teamId to its vote count
    const voteMap = new Map();
    voteCounts.forEach(vote => voteMap.set(vote.rosterId, vote.voteCount));

    // Combine the data and compute the difference for each team
    const combinedData = voteCounts.map(vote => ({
        teamId: vote.rosterId,
        voteCount: vote.voteCount,
        winCount: winMap.get(vote.rosterId) || 0,
        difference: vote.voteCount - (winMap.get(vote.rosterId) || 0)
    }));

    // Sort the teams based on the difference
    combinedData.sort((a, b) => b.difference - a.difference);

    const topResult = combinedData[0];
    if (topResult) {
        const sleeperRosterRepo = getRepository(SleeperRosterEntity);
        const teamRepo = getRepository(TeamEntity);
        const rosterResult = await sleeperRosterRepo.findOne(topResult.teamId);
        return rosterResult ? await teamRepo.findOne({ where: { roster: rosterResult }}) : null;
    } else {
        return null;
    }
}
