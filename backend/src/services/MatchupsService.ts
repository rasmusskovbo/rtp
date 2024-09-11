import {getRepository, In, QueryFailedError} from "typeorm";
import { SleeperMatchupModel } from "../models/SleeperMatchupModel";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import {getMatchupsByWeek} from "../clients/SleeperClient";
import {mapMatchups} from "../mappers/MatchupsMapper";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {VoteEntity} from "../database/entities/VoteEntity";
import {UserEntity} from "../database/entities/UserEntity";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {SleeperService} from "./SleeperService";

const MATCHUPS_CACHE_KEY = "matchups"
const MATCHUP_CACHE_EXPIRATION = 60 * 5; // 5 minutes
const VOTE_CACHE_EXPIRATION = 60 * 5; // 5 minutes
const ss = new SleeperService()

export interface UserVoteRequest {
    userAsString: string,
    matchupId: number,
    rosterId?: number
}

export interface MatchupVoteTotals {
    homeTeam: number,
    awayTeam: number
}

export type UserVoteResult = {
    hasVoted: boolean;
    votedRosterId?: string;
};

// Will run in a job every wednesday morning. Can be called to manually map matchups.
export async function upsertAndMapMatchupsForWeek(week: number): Promise<void> {
    try {
        console.log(`Fetching Sleeper Matchups for week: ${week}...`)
        const sleeperMatchups: SleeperMatchupModel[] = await getMatchupsByWeek(week);

        console.log(`Mapping Matchups for week: ${week}...`)
        const mappedMatchups: MatchupEntity[] = await mapMatchups(sleeperMatchups, week);

        // Get the repository to interact with the database
        const matchupRepository = getRepository(MatchupEntity);

        // Iterate through the mapped matchups and update or insert them
        for (const mappedMatchup of mappedMatchups) {
            const existingMatchup = await matchupRepository.findOne({
                where: { matchup_id: mappedMatchup.matchup_id, week: mappedMatchup.week }
            });

            if (existingMatchup) {
                // If it already exists, only update points
                console.log(existingMatchup.id+ " Updating existing matchup with pts: " + mappedMatchup.home_team_points + ", " + mappedMatchup.away_team_points)
                existingMatchup.home_team_points = mappedMatchup.home_team_points;
                existingMatchup.away_team_points = mappedMatchup.away_team_points;

                await matchupRepository.save(existingMatchup);
            } else {
                await matchupRepository.save(mappedMatchup)
            }
        }
        console.log("Matchups have been saved to the database");
    } catch (error) {
        console.error("An error occurred while fetching and saving matchups", error);
    }
}

// Automatically fetches matchups for current week based on DB input.
export async function getMatchupsForCurrentWeek(): Promise<MatchupEntity[]> {
    try {
        const currentWeekRepo = getRepository(CurrentWeekEntity);
        const currentWeek = await currentWeekRepo.find();

        if (!currentWeek) {
            throw new Error("Current week not found");
        }

        const matchupRepository = getRepository(MatchupEntity);
        const matchups = await matchupRepository.find({
            where: { week: currentWeek[0].weekNumber },
            relations: ['home_team', 'home_team.starters', 'home_team.team', 'away_team', 'away_team.starters', 'away_team.team'],
        });

        const matchupsWithVotes = await Promise.all(matchups.map(async (matchup) => {
            const voteTotals = await getVoteTotalsForMatchup(matchup.id);
            return {
                ...matchup,
                voteTotals
            };
        }));

        return matchupsWithVotes;
    } catch (error) {
        console.error("An error occurred while getting matchups for the current week:", error);
        return [];
    }
}

/**
 * Fetches matchups for a specific week.
 * @param {number} weekNumber - The desired week number.
 * @returns {Promise<MatchupEntity[]>} - Promise that resolves with the matchups.
 */
export async function getMatchupsForWeek(weekNumber: number): Promise<MatchupEntity[]> {
    try {
        const matchupRepository = getRepository(MatchupEntity);
        const matchups = await matchupRepository.find({
            where: { week: weekNumber },
            relations: ['home_team', 'home_team.starters', 'home_team.team', 'away_team', 'away_team.starters', 'away_team.team', 'winner'],
        });

        const matchupsWithVotes = await Promise.all(matchups.map(async (matchup) => {
            const voteTotals = await getVoteTotalsForMatchup(matchup.id);
            return {
                ...matchup,
                voteTotals
            };
        }));

        return matchupsWithVotes;
    } catch (error) {
        console.error(`An error occurred while getting matchups for week ${weekNumber}:`, error);
        return [];
    }
}


export async function getUserVote(request: UserVoteRequest): Promise<UserVoteResult> {
    try {
        console.log(`Checking if user: ${request.userAsString} has voted in matchup with id: ${request.matchupId}`);
        const weekRepository = getRepository(CurrentWeekEntity);
        const currentWeekEntity = await weekRepository.find();

        if (currentWeekEntity[0].voteLockedOut) {
            return { hasVoted: false };
        }

        const userRepository = getRepository(UserEntity);
        const matchupRepository = getRepository(MatchupEntity);
        const voteRepository = getRepository(VoteEntity);

        const user = await userRepository.findOne({ where: { username: parseUsername(request.userAsString) }});
        const matchup = await matchupRepository.findOne({ where: { id: request.matchupId } });

        if (!user || !matchup) {
            console.error("User or matchup not found");
            return { hasVoted: false };
        }

        const vote = await voteRepository.findOne({
            where: {
                user: { id: user.id },
                matchup: { id: matchup.id }
            },
            relations: ['roster']
        });

        const hasVoted = !!vote;
        const votedRosterId = vote ? vote.roster.id.toString() : undefined;

        console.log("Has voted:", hasVoted, "Voted for roster:", votedRosterId);

        return { hasVoted, votedRosterId };

    } catch (error) {
        console.error("An error occurred while checking if the user has voted:", error);
        return { hasVoted: false };
    }
}

export async function getUserVotesByUsernameAndWeek(username: string, week: number): Promise<VoteEntity[]> {
    try {
        console.log(`Fetching votes for user: ${username} during week: ${week}`);

        const userRepository = getRepository(UserEntity);
        const matchupRepository = getRepository(MatchupEntity);
        const voteRepository = getRepository(VoteEntity);

        const user = await userRepository.findOne({ where: { username } });

        if (!user) {
            console.error("User not found");
            return [];
        }

        const matchupsForWeek = await matchupRepository.find({ where: { week } });

        if (!matchupsForWeek.length) {
            console.log("No matchups found for the given week");
            return [];
        }

        const votes = await voteRepository.find({
            where: {
                user: { id: user.id },
                matchup: In(matchupsForWeek.map(matchup => matchup.id))
            },
            relations: ['roster', 'matchup']
        });

        return votes;

    } catch (error) {
        console.error("An error occurred while fetching user votes for the week:", error);
        return [];
    }
}

export async function castVoteForMatchup(request: UserVoteRequest): Promise<boolean> {
    try {

        console.log(`Attempting to cast vote for user: ${request.userAsString} in matchup with id: ${request.matchupId} -> vote is for roster id: ${request.rosterId}`)

        // Is vote locked out currently
        const weekRepository = getRepository(CurrentWeekEntity)
        const currentWeekEntity = await weekRepository.find()
        if (currentWeekEntity[0].voteLockedOut) {
            return false
        }

        // Get repositories to interact with the database
        const userRepository = getRepository(UserEntity);
        const matchupRepository = getRepository(MatchupEntity);
        const rosterRepository = getRepository(SleeperRosterEntity);
        const voteRepository = getRepository(VoteEntity);

        // Find the user, matchup, and roster using the provided request data
        const user = await userRepository.findOne({ where: { username: parseUsername(request.userAsString) }});
        const matchup = await matchupRepository.findOne({ where: { id: request.matchupId }});
        const roster = await rosterRepository.findOne({ where: { id: request.rosterId }});


        // Ensure the user, matchup, and roster exist
        if (!user || !matchup || !roster) {
            console.log(user + " " + matchup + " " + roster)
            console.error("User, matchup, or roster not found");
            return false;
        }

        // Check if a vote from this user for this matchup already exists
        let existingVote = await voteRepository.findOne({
            where: {
                user: { id: user.id },
                matchup: { id: matchup.id }
            }
        });

        if (existingVote) {
            // If a vote exists, update the roster for the vote
            existingVote.roster = roster;
            await voteRepository.save(existingVote);
            console.log(`Vote updated for user: ${request.userAsString}, matchupId: ${request.matchupId}, rosterId: ${request.rosterId}`);
            return true;
        } else {
            // If no vote exists, create a new vote
            const vote = new VoteEntity();
            vote.user = user;
            vote.matchup = matchup;
            vote.roster = roster;

            // Save the vote to the database
            try {
                await voteRepository.save(vote);
                console.log(`Vote successfully cast for user: ${request.userAsString}, matchupId: ${request.matchupId}, rosterId: ${request.rosterId}`);
                return true;
            } catch (error) {
                console.error(`Failed to save the new vote: ${error}`);
                return false;
            }
        }
    } catch (error) {
        console.error("An error occurred while casting the vote:", error);
        return false;
    }
}

async function getVoteTotalsForMatchup(matchupId: number): Promise<MatchupVoteTotals> {
    // Get the matchup entity
    const matchupRepository = getRepository(MatchupEntity);
    const matchup = await matchupRepository.findOne({
        where: { id: matchupId },
        relations: ['home_team', 'away_team']
    });

    if (!matchup) {
        throw new Error('Matchup not found');
    }

    // Get all votes for the given matchup
    const voteRepository = getRepository(VoteEntity);
    const votes = await voteRepository.find({
        where: { matchup: { id: matchup.id }},
        relations: ['roster']
    });

    // Initialize vote totals for home and away teams
    const voteTotals: MatchupVoteTotals = {
        homeTeam: 0,
        awayTeam: 0
    }

    // Iterate through the votes and calculate the vote totals
    console.log("Matchup ID: " + matchupId)
    console.log("Votes Length: " + votes.length)
    if (votes.length > 0) {
        for (const vote of votes) {
            if (matchup.home_team && vote.roster.id === matchup.home_team.id) {
                voteTotals.homeTeam++;
            } else if (matchup.away_team && vote.roster.id === matchup.away_team.id) {
                voteTotals.awayTeam++;
            }
        }
    }

    return voteTotals;
}

export function parseUsername(userAsString: string): string {
    const parsedObject = JSON.parse(userAsString);
    return parsedObject.name;
}

