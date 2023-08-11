import {getRepository, QueryFailedError} from "typeorm";
import { SleeperMatchup } from "../models/SleeperMatchup";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import {getMatchupsByWeek} from "../clients/SleeperClient";
import {mapMatchups} from "../mappers/MatchupsMapper";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {getFromCache, getObjectFromCache, putInCache, putObjectInCache} from "../cache/RedisClient";
import {VoteEntity} from "../database/entities/VoteEntity";
import {UserEntity} from "../database/entities/UserEntity";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";

const MATCHUP_CACHE_EXPIRATION = 60 * 10; // 10 minutes
const VOTE_CACHE_EXPIRATION = 60 * 60 * 3; // 3 hours

export interface UserVoteRequest {
    userAsString: string,
    matchupId: number,
    rosterId?: number
}


export async function fetchAndMapMatchupsForWeek(week: number): Promise<void> {
    try {
        console.log(`Fetching Sleeper Matchups for week: ${week}...`)
        const sleeperMatchups: SleeperMatchup[] = await getMatchupsByWeek(week);

        console.log(`Mappingr Matchups for week: ${week}...`)
        const mappedMatchups: MatchupEntity[] = await mapMatchups(sleeperMatchups, week);

        // Get the repository to interact with the database
        const matchupRepository = getRepository(MatchupEntity);

        // Save the mapped matchups to the database
        await matchupRepository.save(mappedMatchups);

        console.log("Matchups have been saved to the database");
    } catch (error) {
        console.error("An error occurred while fetching and saving matchups", error);
    }
}

export async function getMatchupsForCurrentWeek(): Promise<MatchupEntity[]> {
    try {
        // Get the current week from cache first
        const cachedCurrentWeek = await getObjectFromCache<CurrentWeekEntity>("currentWeek", "week");
        if (cachedCurrentWeek) {
            const cachedMatchups = await getObjectFromCache<MatchupEntity[]>("matchups", "currentWeek");
            if (cachedMatchups) return cachedMatchups;
        }

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

        // Cache the current week and matchups
        await putObjectInCache("currentWeek", currentWeek, MATCHUP_CACHE_EXPIRATION, "week");
        await putObjectInCache("matchups", matchups, MATCHUP_CACHE_EXPIRATION, "currentWeek");

        return matchups;
    } catch (error) {
        console.error("An error occurred while getting matchups for the current week:", error);
        return [];
    }
}

export async function checkIfUserHasVoted(request: UserVoteRequest): Promise<boolean> {
    try {
        const cacheKey = `userVote:${request.userAsString}:${request.matchupId}`;
        const cachedVote = await getFromCache(cacheKey, "hasVoted");
        if (cachedVote) {
            return true;
        }

        console.log(`Checking if user: ${request.userAsString} has voted in matchup with id: ${request.matchupId}`);

        // Get repositories to interact with the database
        const userRepository = getRepository(UserEntity);
        const matchupRepository = getRepository(MatchupEntity);
        const voteRepository = getRepository(VoteEntity);

        // Find the user and matchup using the provided request data
        const user = await userRepository.findOne({ where: { username: parseUsername(request.userAsString) }});
        const matchup = await matchupRepository.findOne({ where: { id: request.matchupId }});

        // Ensure the user and matchup exist
        if (!user || !matchup) {
            console.error("User or matchup not found");
            return false;
        }

        // Check if a vote exists for the given user and matchup
        const vote = await voteRepository.findOne({
            where: {
                user: { id: user.id },
                matchup: { id: matchup.id }
            }
        });

        const hasVoted = !!vote;
        // Cache the result
        await putInCache(cacheKey, hasVoted.toString(), VOTE_CACHE_EXPIRATION, "hasVoted");

        return hasVoted;
    } catch (error) {
        console.error("An error occurred while checking if the user has voted:", error);
        return false;
    }
}



export async function castVoteForMatchup(request: UserVoteRequest): Promise<boolean> {
    try {
        console.log(`Casting vote for user: ${request.userAsString} in matchup with id: ${request.matchupId} -> vote is for roster id: ${request.rosterId}`)
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
            console.error("User, matchup, or roster not found");
            return false;
        }

        // Create a new vote entity
        const vote = new VoteEntity();
        vote.user = user;
        vote.matchup = matchup;
        vote.roster = roster;

        // Save the vote to the database
        try {
            await voteRepository.save(vote);
            console.log(`Vote successfully cast for user: ${request.userAsString}, matchupId: ${request.matchupId}, rosterId: ${request.rosterId}`);
            return true;
        } catch (QueryFailedError: any) {
            console.error(`Vote already cast for matchup: user: ${request.userAsString}, matchupId: ${request.matchupId}, rosterId: ${request.rosterId}`);
            return false
        }
    } catch (error) {
        console.error("An error occurred while casting the vote:", error);
        return false;
    }
}

export function parseUsername(userAsString: string): string {
    const parsedObject = JSON.parse(userAsString);
    return parsedObject.name;
}

