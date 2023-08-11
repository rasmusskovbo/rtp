import { getRepository } from "typeorm";
import { SleeperMatchup } from "../models/SleeperMatchup";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import {getMatchupsByWeek} from "../clients/SleeperClient";
import {mapMatchups} from "../mappers/MatchupsMapper";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {getObjectFromCache, putObjectInCache} from "../cache/RedisClient";

const MATCHUP_CACHE_EXPIRATION = 60 * 10; // 10 minutes

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
