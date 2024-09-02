import {fetchAllPlayers, getRostersByLeagueId, doGetSleeperUserByUsername} from "../clients/SleeperClient";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import { getRepository } from 'typeorm';
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {SleeperRosterModel} from "../models/SleeperRosterModel";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import dotenv from "dotenv";
import {getObjectFromCache, putObjectInCache} from "../cache/RedisClient";
import {mapRosterToEntity} from "../mappers/RosterMapper";
import {TeamEntity} from "../database/entities/TeamEntity";

dotenv.config()

export const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/";
const CACHE_FIELD = "sleeperService";
const AVATAR_EXPIRATION = 60 * 60 * 24; // 24 hours
const ROSTER_EXPIRATION = 60 * 60 * 24; // 24 hours
export const SLEEPER_LEAGUE_ID = "1097262136528719872";
//Dynasty -> "917218485867139072" RTP -> 976587245010333696

export class SleeperService {
    public async getSleeperUserBySleeperUsername(username: string): Promise<SleeperUserEntity> {
        // Check cache for user
        console.log(`Checking cache for user with username: ${username}`);
        const cachedUser = await getObjectFromCache<SleeperUserEntity>(username, CACHE_FIELD);
        if (cachedUser) {
            console.log("CACHE HIT. Returning result.");
            return cachedUser;
        }

        // Check the database
        console.log("NO CACHE. Checking database...");
        const sleeperRepo = getRepository(SleeperUserEntity);
        let dbSleeperUser = await sleeperRepo.findOne({ where: { username } });
        if (dbSleeperUser) {
            console.log("DATABASE HIT. Caching and returning result.");
            await putObjectInCache(username, dbSleeperUser, ROSTER_EXPIRATION, CACHE_FIELD);
            return dbSleeperUser;
        }

        // Fetch new data using sleeperClient
        console.log("No user found in Database or Cache. Fetching new data...");
        const sleeperUser = await doGetSleeperUserByUsername(username);
        if (sleeperUser) {
            dbSleeperUser = new SleeperUserEntity();

            dbSleeperUser.user_id = sleeperUser.user_id;
            dbSleeperUser.username = username;
            dbSleeperUser.display_name = sleeperUser.display_name;
            dbSleeperUser.avatar = BASEURL_SLEEPER_AVATAR + sleeperUser.avatar;

            await sleeperRepo.save(dbSleeperUser);

            // Save in cache
            await putObjectInCache(username, dbSleeperUser, ROSTER_EXPIRATION, CACHE_FIELD);
            console.log("User was successfully fetched and cached. Returning user.");
            return dbSleeperUser;
        } else {
            throw new Error(`Unable to find user for username ${username}`);
        }
    }

    // Owner ID = user_id in SleeperUserEntity table
    public async getSleeperRosterForOwnerId(ownerId: string): Promise<SleeperRosterEntity> {
        // Checking the cache
        console.log("Checking cache for roster with owner ID: " + ownerId)
        let roster = await getObjectFromCache<SleeperRosterEntity>(ownerId, CACHE_FIELD);

        // If in cache, return cache
        if (roster) {
            console.log("CACHE HIT. Returning result.")
            return roster;
        }

        // Get repository for the RosterEntity
        const repo = getRepository(SleeperRosterEntity);

        console.log("NO CACHE. Checking database....")
        // Check if a RosterEntity with the ownerId exists
        roster = await repo.findOne({ where: { owner_id: ownerId }, relations: ["starters"] }) || undefined;

        if (roster) {
            console.log("DATABASE HIT..")

            console.log("Caching roster...")
            await putObjectInCache(ownerId, roster!, ROSTER_EXPIRATION, CACHE_FIELD);

            console.log("Returning updated roster.")
            return roster;
        }

        console.log("No roster found in Database or Cache. Force refreshing...");
        // If roster wasnt in cache or database, force refresh all rosters and insert into the db.
        await this.fetchAndUpsertRostersJob()

        roster = await repo.findOne({ where: { owner_id: ownerId }, relations: ["starters"] }) || undefined;

        if (roster) {
            console.log("Roster was sucessfully refreshed. Returning roster.")
            await putObjectInCache(ownerId, roster!, ROSTER_EXPIRATION, CACHE_FIELD);
            return roster
        } else {
            throw new Error(`Unable to find roster for ownerId ${ownerId}`);
        }
    }

    public async fetchAndUpsertRostersJob(): Promise<void> {
        await this.initialLoadIfEmpty();

        const rosters: SleeperRosterModel[] = await getRostersByLeagueId();
        const repo = getRepository(SleeperRosterEntity);

        for (const roster of rosters) {
            const rosterEntity = await mapRosterToEntity(roster);
            await repo.save(rosterEntity);
        }
    }

    public async updatePlayersJob(): Promise<void> {
        const players: PlayerEntity[] = await fetchAllPlayers();
        const repo = getRepository(PlayerEntity);

        for (const player of players) {
            const existingPlayer = await repo.findOne({ where: { player_id: player.player_id } });
            if (existingPlayer) {
                Object.assign(existingPlayer, player); // Updates the existing player with new data
                await repo.save(existingPlayer);
            } else {
                await repo.save(player); // Insert new player if not found
            }
        }

        console.log('Players updated successfully.');
    }

    public async initialLoadIfEmpty(): Promise<void> {
        const rosterRepo = getRepository(SleeperRosterEntity);
        const playerRepo = getRepository(PlayerEntity);
        await this.fetchAndUpdateAllSleeperUsers()

        // Check if rosters repository is empty
        const rosterCount = await rosterRepo.count();
        // Check if players repository is empty
        const playerCount = await playerRepo.count();

        if (rosterCount === 0 && playerCount === 0) {
            console.log('Both rosters and players repositories are empty. Initiating update jobs...');

            // Call the update jobs
            await this.updatePlayersJob();
            await this.fetchAndUpsertRostersJob();

            console.log('Update jobs completed successfully.');
        } else {
            console.log('Rosters and/or players repositories are not empty. Skipping update jobs.');
        }
    }

    // Uses the usernames in the team repo to fetch all sleeperuser info, incl ids
    public async fetchAndUpdateAllSleeperUsers() {
        console.log("Updating all users based on team repo")
        const teamRepo = getRepository(TeamEntity)

        const allTeams = await teamRepo.find()
        await allTeams.forEach(team => {
             this.getSleeperUserBySleeperUsername(team.sleeperUsername);
        });
    }

}