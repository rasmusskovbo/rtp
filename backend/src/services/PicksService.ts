import {getRepository} from "typeorm";
import {MatchupEntity} from "../database/entities/MatchupEntity";
import {VoteEntity} from "../database/entities/VoteEntity";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {DateTime} from 'luxon';

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

    // Fetch all matchups or filter based on your criteria
    const matchups = await matchupRepository.find({
        where: { week: week},
        relations: ['home_team', 'away_team']
    });

    // Iterate through matchups and determine the winner
    for (const matchup of matchups) {
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
        // Fetch votes for the current matchup
        const votes = await voteRepository.find({
            where: { matchup: {id: matchup.id}},
            relations: ['roster']
        });

        // Iterate through each vote
        for (const vote of votes) {
            if (matchup.winner) {
                // vote was correct if IDs match
                vote.voteCorrect = vote.roster === matchup.winner;
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
        .addSelect('SUM(CASE WHEN vote.voteCorrect THEN 1 ELSE 0 END)', 'correctpickscount') // Notice the double quotes
        .addSelect('COUNT(vote.id)', 'totalvotes')
        .groupBy('user.username')
        .orderBy('correctpickscount', 'DESC') // Notice the double quotes
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
        const nextSun = DateTime.now().setZone('Europe/Brussels').plus({ days: (7 - DateTime.now().weekday + 7) % 7 }).set({ hour: 17, minute: 0, second: 0, millisecond: 0 });
        return { date: nextSun, isVoteLockedOut: false };
    }
}







