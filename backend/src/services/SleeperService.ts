import {fetchAllPlayers, getRostersByLeagueId, getSleeperUserByUsername} from "../clients/SleeperClient";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import { getRepository } from 'typeorm';
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {SleeperRoster} from "../models/SleeperRoster";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import dotenv from "dotenv";
import {getFromCache, getObjectFromCache, putInCache, putObjectInCache} from "../cache/RedisClient";
import {mapRosterToEntity} from "../mappers/RosterMapper";

dotenv.config()

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/";
const CACHE_FIELD = "sleeperService";
const AVATAR_EXPIRATION = 60 * 60 * 24; // 24 hours
const ROSTER_EXPIRATION = 60 * 60 * 24; // 24 hours
export const SLEEPER_LEAGUE_ID = "976587245010333696";
const DYNASTY_TEST_ID = "917218485867139072";

export class SleeperService {
    public async getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
        const cachedAvatarUrl = await getFromCache(username, CACHE_FIELD)

        return cachedAvatarUrl ? cachedAvatarUrl : await this.fetchAvatarURLAndInsertSleeperUser(username)
    }

    public async getSleeperUserByUsername(username: string): Promise<SleeperUserEntity | null> {
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
        const sleeperUser = await getSleeperUserByUsername(username);
        if (sleeperUser) {
            // Insert or update the database
            dbSleeperUser = dbSleeperUser ? dbSleeperUser : new SleeperUserEntity();
            Object.assign(dbSleeperUser, sleeperUser);
            await sleeperRepo.save(dbSleeperUser);

            // Save in cache
            await putObjectInCache(username, dbSleeperUser, ROSTER_EXPIRATION, CACHE_FIELD);
            console.log("User was successfully fetched and cached. Returning user.");
            return dbSleeperUser;
        } else {
            throw new Error(`Unable to find user for username ${username}`);
        }
    }


    private async fetchAvatarURLAndInsertSleeperUser(username: string): Promise<string> {
        try {
            const sleeperUser = await getSleeperUserByUsername(username);

            if (sleeperUser) {
                const avatarUrl = BASEURL_SLEEPER_AVATAR + sleeperUser.avatar;
                await putInCache(username, avatarUrl, AVATAR_EXPIRATION, CACHE_FIELD);

                // Get repository for the SleeperUserEntity
                const repo = getRepository(SleeperUserEntity);

                // Check if a SleeperUserEntity with the username exists
                let dbSleeperUser = await repo.findOne({ where: { username } });

                // Create or update the SleeperUserEntity
                dbSleeperUser = dbSleeperUser ? dbSleeperUser : new SleeperUserEntity();

                dbSleeperUser.user_id = sleeperUser.user_id;
                dbSleeperUser.username = username;
                dbSleeperUser.display_name = sleeperUser.display_name;
                dbSleeperUser.avatar = sleeperUser.avatar;

                await repo.save(dbSleeperUser);

                return avatarUrl;
            } else {
                console.log("Unable to save fetch data for Sleeper user: " + username);
                return "N/A";
            }
        } catch (err) {
            console.error(`An error occurred while fetching and inserting Sleeper user: ${err}`);
            return "N/A";
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

        const rosters: SleeperRoster[] = await getRostersByLeagueId();
        const repo = getRepository(SleeperRosterEntity);
        const playerRepo = getRepository(PlayerEntity);

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

    private async initialLoadIfEmpty(): Promise<void> {
        const rosterRepo = getRepository(SleeperRosterEntity);
        const playerRepo = getRepository(PlayerEntity);

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

}
