import { getRepository } from "typeorm";
import { SleeperMatchup } from "../models/SleeperMatchup";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import {getMatchupsByWeek} from "../clients/SleeperClient";
import {mapMatchups} from "../mappers/MatchupsMapper";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {SleeperService} from "./SleeperService"; // Adjust the import path if needed

export async function fetchAndMapMatchupsForWeek(week: number): Promise<void> {
    try {
        // dev setup
        /*
        const sleeperService = new SleeperService()
        await sleeperService.fetchAndUpdateAllSleeperUsers() // TODO
        await sleeperService.fetchAndUpsertRostersJob()

         */

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

// TODO use cache and try/catch here
export async function getMatchupsForCurrentWeek(): Promise<MatchupEntity[]> {
    //await fetchAndMapMatchupsForWeek(1);

    const matchupRepository = getRepository(MatchupEntity);
    const currentWeekRepo = getRepository(CurrentWeekEntity)
    const currentWeek = await currentWeekRepo.find() // Todo

    const matchups = await matchupRepository.find({
        where: { week: currentWeek[0].weekNumber },
        relations: ['home_team', 'home_team.starters', 'home_team.team', 'away_team', 'away_team.starters', 'away_team.team'],
    });

    return matchups;
}



/*

import { getRepository } from "typeorm";
import { IMatchup } from "./IMatchup";

const matchups = await getRepository(IMatchup)
    .createQueryBuilder("matchup")
    .leftJoinAndSelect("matchup.team1", "team1")
    .leftJoinAndSelect("team1.team", "team1Info")
    .leftJoinAndSelect("matchup.team2", "team2")
    .leftJoinAndSelect("team2.team", "team2Info")
    .getMany();

// Now, matchups include team information, and you can access team1Info.teamName and team2Info.teamName

 */
