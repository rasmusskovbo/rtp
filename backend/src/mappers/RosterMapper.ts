import { SleeperRosterModel } from "../models/SleeperRosterModel";
import { getRepository } from "typeorm";
import { SleeperRosterEntity } from "../database/entities/SleeperRosterEntity";
import { TeamEntity } from "../database/entities/TeamEntity";
import { SleeperUserEntity } from "../database/entities/SleeperUserEntity";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import {SLEEPER_LEAGUE_ID} from "../services/SleeperService";

export async function mapRosterToEntity(roster: SleeperRosterModel): Promise<SleeperRosterEntity> {
    const rosterRepository = getRepository(SleeperRosterEntity);
    const teamRepository = getRepository(TeamEntity);
    const sleeperUserRep = getRepository(SleeperUserEntity);
    const playerRepo = getRepository(PlayerEntity);

    // Find sleeper username using owner_id
    const sleeperUser = await sleeperUserRep.findOne({ where: { user_id: roster.owner_id } });

    if (!sleeperUser) {
        console.error(`Sleeper user not found for owner_id: ${roster.owner_id}`);
        throw new Error(`Sleeper user not found for owner_id: ${roster.owner_id}`);
    }

    // Use sleeper username to find corresponding team entity
    const team = await teamRepository.findOne({ where: { sleeperUsername: sleeperUser.username } });

    if (!team) {
        console.error(`Team not found for sleeperUsername: ${sleeperUser.username}`);
        throw new Error(`Team not found for sleeperUsername: ${sleeperUser.username}`);
    }

    let rosterEntity = await rosterRepository.findOne({ where: { owner_id: roster.owner_id } });

    const allIds = [
        ...(roster.players || []),
        ...(roster.starters || []),
        ...(roster.reserve || []),
    ];

    const allEntities = await playerRepo.findByIds(allIds);

    const players = allEntities.filter((player) => roster.players?.includes(player.player_id));
    const starters = allEntities.filter((player) => roster.starters?.includes(player.player_id));
    const reserves = allEntities.filter((player) => roster.reserve?.includes(player.player_id));

    if (rosterEntity) {
        rosterEntity.settings = roster.settings;
        rosterEntity.roster_id = roster.roster_id;
        rosterEntity.starters = starters;
        rosterEntity.players = players;
        rosterEntity.reserve = reserves;
    } else {
        rosterEntity = new SleeperRosterEntity();
        rosterEntity.owner_id = roster.owner_id;
        rosterEntity.league_id = SLEEPER_LEAGUE_ID; // replace with the actual league_id
        rosterEntity.roster_id = roster.roster_id;
        rosterEntity.settings = roster.settings;
        rosterEntity.starters = starters;
        rosterEntity.players = players;
        rosterEntity.reserve = reserves;
    }

    // Set the team relationship
    rosterEntity.team = team;

    // Save roster
    await rosterRepository.save(rosterEntity);

    return rosterEntity;
}


