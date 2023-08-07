import { getRepository } from "typeorm";
import { TeamEntity } from '../database/entities/TeamEntity';
import { AllTimeStandingsEntity } from '../database/entities/AllTimeStandingsEntity';
import { AllTimeWinnersEntity } from '../database/entities/AllTimeWinnersEntity';
import {SleeperService} from "./SleeperService";
import {RedisCache} from "../cache/RedisClient";
import {getSleeperUserByUsername} from "../clients/SleeperClient";

const TEAMS_EXPIRATION_TIME = 60 * 60 * 12; // 12 hours

export interface TeamData {
    teamLogo: string;
    ownerImage: string;
    teamName: string;
    ownerName: string;
    teamMascot: string;
    yearsInLeague: number;
    bio: string;
    allTimeStats: {
        wins: number;
        playoffAppearances: number;
        pinks: number;
        allTimeRecord: string;
    };
    seasonStats: {
        wins: number;
        losses: number;
        ties: number;
        fpts: number,
        fpts_against: number;
    };
    activeRoster: {
        name: string;
        position: string;
    }[];
}

export class TeamsService {
    private static redisCache = new RedisCache();

    static async getAllTeams() : Promise<TeamData[]> {
        const cacheKey = 'allTeams';
        const cacheField = 'teamData';

        // Try to get the data from cache first
        const cachedData = await TeamsService.redisCache.getObject<TeamData[]>(cacheKey, cacheField);

        if (cachedData) {
            console.log("Retrieved teams from cache");
            return cachedData;
        }

        const sleeperService = new SleeperService();
        const teamRepository = getRepository(TeamEntity);
        const allTimeStandingsRepository = getRepository(AllTimeStandingsEntity);
        const allTimeWinnersRepository = getRepository(AllTimeWinnersEntity);

        console.log("Fetching all teams from database")
        const teams = await teamRepository.find();

        const result = Promise.all(teams.map(async (team) => {
            console.log("Fetching owner ID for username: " + team.sleeperUsername);
            const sleeperUser = await getSleeperUserByUsername(team.sleeperUsername)
            let ownerId = "";

            if (!sleeperUser) {
                console.log("ERROR, USER UNDEFINED FOR TEAM: " + team.sleeperUsername)
                throw new Error("ERROR "+team.sleeperUsername)
            } else {
                ownerId = sleeperUser.user_id;
            }

            console.log("Beginning data mapping for team with Sleeper Owner ID: " + ownerId + "owner name: " + team.ownerName);

            // Update underlying roster with latest information
            console.log("Get roster from cache or database...");
            const roster = await sleeperService.getSleeperRosterForOwnerId(ownerId);

            console.log("Fetch relevant stats...");
            const standings = await allTimeStandingsRepository.findOne({ where: { sleeper_username: team.sleeperUsername } });
            const winners = await allTimeWinnersRepository.findOne({ where: { sleeper_username: team.sleeperUsername } });

            console.log("Finished mapping!")
            return {
                teamLogo: team.teamLogo,
                ownerImage: team.ownerImage,
                teamName: team.teamName,
                ownerName: team.ownerName,
                teamMascot: team.teamMascot,
                yearsInLeague: team.yearsInLeague,
                bio: team.bio,
                allTimeStats: {
                    wins: winners?.wins ?? 0,
                    playoffAppearances: winners?.playoff_appearances ?? 0,
                    pinks: winners?.pinks ?? 0,
                    allTimeRecord: standings?.record ?? "0-0",
                },
                seasonStats: roster ? {
                    wins: roster.settings.wins,
                    losses: roster.settings.losses,
                    ties: roster.settings.ties,
                    fpts: roster.settings.fpts,
                    fpts_against: roster.settings.fpts_against ?? 0,
                } : undefined,
                activeRoster: roster ? roster.starters.map(player => ({
                    name: `${player.first_name} ${player.last_name}`,
                    position: player.position,
                })) : [],
            } as TeamData;
        }));

        // Save the result to cache with a 12-hour expiration time (43200 seconds)
        const finalResult = await result;
        await TeamsService.redisCache.putObject(cacheKey, finalResult, TEAMS_EXPIRATION_TIME, cacheField);

        return result;
    }
}

export default TeamsService;
