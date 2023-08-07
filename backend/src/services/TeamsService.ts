import { getRepository } from "typeorm";
import { TeamEntity } from '../database/entities/TeamEntity';
import { AllTimeStandingsEntity } from '../database/entities/AllTimeStandingsEntity';
import { AllTimeWinnersEntity } from '../database/entities/AllTimeWinnersEntity';
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {SleeperService} from "./SleeperService";

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
        name: string; // full name
        position: string;
    }[];
}

export class TeamsService {
    static async getAllTeams() : Promise<TeamData[]> {
        const sleeperService = new SleeperService();
        const teamRepository = getRepository(TeamEntity);
        const allTimeStandingsRepository = getRepository(AllTimeStandingsEntity);
        const allTimeWinnersRepository = getRepository(AllTimeWinnersEntity);
        const rosterRepository = getRepository(SleeperRosterEntity);

        console.log("Fetching all teams from database")
        const teams = await teamRepository.find({ relations: ["activeRoster"] });
        // what happens if a team upon startup has no activeRoster (it will not, as it needs to be updated with sleeper info first
        // i.e. initial load, teams will only be half finished. this should be handled below
        return Promise.all(teams.map(async (team) => {
            console.log("Beginning data mapping for team with Sleeper Owner ID: " + team.ownerId + "owner name: " + team.ownerName);
            // Update underlying roster with latest information
            console.log("Fetch and upsert roster...");
            const roster = await sleeperService.fetchAndUpsertRosters(team.ownerId);

            console.log("Fetch relevant stats...");
            const standings = await allTimeStandingsRepository.findOne({ where: { sleeper_username: team.sleeperUsername } });
            const winners = await allTimeWinnersRepository.findOne({ where: { sleeper_username: team.sleeperUsername } });

            // TODO should cache team as well.
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
                    fpts_against: roster.settings.fpts_against,
                } : undefined,
                activeRoster: roster ? roster.starters.map(player => ({
                    name: `${player.first_name} ${player.last_name}`,
                    position: player.position,
                })) : [],
            } as TeamData;
        }));
    }
}

export default TeamsService;
