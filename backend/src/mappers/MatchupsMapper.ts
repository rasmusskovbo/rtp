import {SleeperMatchup} from "../models/SleeperMatchup";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {MatchupEntity} from "../database/entities/MatchupEntity";
import {getRepository} from "typeorm";

export async function mapMatchups(sleeperMatchups: SleeperMatchup[], week: number): Promise<MatchupEntity[]> {
    const rosterRepository = getRepository(SleeperRosterEntity);

    let matchupEntities: MatchupEntity[] = [];

    const uniqueMatchupIds = [...new Set(sleeperMatchups.map(matchup => matchup.matchup_id))];

    for (const id of uniqueMatchupIds) {
        console.log(`Attempting to map MatchupEntity for matchup ID ${id} & week: ${week}`)
        const matchupEntity = new MatchupEntity();

        matchupEntity.matchup_id = id;
        matchupEntity.week = week;

        const matchupTeams: SleeperMatchup[] = sleeperMatchups.filter(matchup => matchup.matchup_id == id);

        if (matchupTeams.length >= 2) {
            // Note we're assuming that API response will always be in same order when updating (it seems to be)
            // If not, we may need to do some extra checks on IDs to x-reference
            matchupEntity.home_team = await rosterRepository.findOne({ where: { roster_id: matchupTeams[0].roster_id } });
            matchupEntity.home_team_points = matchupTeams[0].points;

            matchupEntity.away_team = await rosterRepository.findOne({ where: { roster_id: matchupTeams[1].roster_id } });
            matchupEntity.away_team_points = matchupTeams[1].points
        }

        matchupEntities.push(matchupEntity);
    }

    return matchupEntities;
}