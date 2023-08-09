import { getRepository } from "typeorm";
import { SleeperMatchup } from "../models/SleeperMatchup";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import {getMatchupsByWeek} from "../clients/SleeperClient";
import {mapMatchups} from "../mappers/MatchupsMapper";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity"; // Adjust the import path if needed

export async function fetchAndMapMatchupsForWeek(week: number): Promise<void> {
    try {
        // Fetch matchups from the sleeper client
        const sleeperMatchups: SleeperMatchup[] = await getMatchupsByWeek(week);

        // Map the matchups using the provided mapMatchups function
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
    const matchupRepository = getRepository(MatchupEntity);
    const currentWeekRepo = getRepository(CurrentWeekEntity)
    const currentWeek = await currentWeekRepo.find()

    const matchups = await matchupRepository.find({
        where: { week: currentWeek[0].weekNumber },
        relations: ['home_team', 'away_team'],
    });

    return matchups;
}



/*

import { getRepository } from "typeorm";
import { Matchup } from "./Matchup";

const matchups = await getRepository(Matchup)
    .createQueryBuilder("matchup")
    .leftJoinAndSelect("matchup.team1", "team1")
    .leftJoinAndSelect("team1.team", "team1Info")
    .leftJoinAndSelect("matchup.team2", "team2")
    .leftJoinAndSelect("team2.team", "team2Info")
    .getMany();

// Now, matchups include team information, and you can access team1Info.teamName and team2Info.teamName

 */
