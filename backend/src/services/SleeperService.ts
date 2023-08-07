import {fetchAllPlayers, getRostersByLeagueId, getSleeperUserByUsername} from "../clients/SleeperClient";
import {RedisCache} from "../cache/RedisClient";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import { getRepository } from 'typeorm';
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {SleeperRoster} from "../models/SleeperRoster";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import dotenv from "dotenv";

dotenv.config()

const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/";
const CACHE_FIELD = "sleeperService";
const AVATAR_EXPIRATION = 60 * 60 * 24; // 24 hours
const ROSTER_EXPIRATION = 60 * 60 * 24; // 24 hours
const SLEEPER_LEAGUE_ID = "976587245010333696";
const DYNASTY_TEST_ID = "917218485867139072";

export class SleeperService {
    private cache: RedisCache;

    constructor() {
        this.cache = new RedisCache();
    }

    public async getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
        const cachedAvatarUrl = await this.cache.get(username, CACHE_FIELD)

        return cachedAvatarUrl ? cachedAvatarUrl : await this.fetchAvatarURLAndInsertSleeperUser(username)
    }

    public async getSleeperUserByUsername(username: string): Promise<SleeperUserEntity | null> {
        // Check cache for user
        console.log(`Checking cache for user with username: ${username}`);
        const cachedUser = await this.cache.getObject<SleeperUserEntity>(username, CACHE_FIELD);
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
            this.cache.putObject(username, dbSleeperUser, ROSTER_EXPIRATION, CACHE_FIELD);
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
            this.cache.putObject(username, dbSleeperUser, ROSTER_EXPIRATION, CACHE_FIELD);
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
                this.cache.put(username, avatarUrl, AVATAR_EXPIRATION, CACHE_FIELD);

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
        let roster = await this.cache.getObject<SleeperRosterEntity>(ownerId, CACHE_FIELD);

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
            this.cache.putObject(ownerId, roster!, ROSTER_EXPIRATION, CACHE_FIELD);

            console.log("Returning updated roster.")
            return roster;
        }

        console.log("No roster found in Database or Cache. Force refreshing...");
        // If roster wasnt in cache or database, force refresh all rosters and insert into the db.
        await this.fetchAndUpsertRostersJob()

        roster = await repo.findOne({ where: { owner_id: ownerId }, relations: ["starters"] }) || undefined;

        if (roster) {
            console.log("Roster was sucessfully refreshed. Returning roster.")
            this.cache.putObject(ownerId, roster!, ROSTER_EXPIRATION, CACHE_FIELD);
            return roster
        } else {
            throw new Error(`Unable to find roster for ownerId ${ownerId}`);
        }
    }

    // todo do something for initial load (if both roster and player repo is empty call a loader)
    public async fetchAndUpsertRostersJob(): Promise<void> {
        const rosters: SleeperRoster[] = await getRostersByLeagueId(DYNASTY_TEST_ID);
        const repo = getRepository(SleeperRosterEntity);
        const playerRepo = getRepository(PlayerEntity);

        for (const roster of rosters) {
            // Check if the roster is already in the database
            let rosterEntity = await repo.findOne({ where: { owner_id: roster.owner_id } });

            // Concatenate all the IDs
            const allIds = [
                ...(roster.players || []),
                ...(roster.starters || []),
                ...(roster.reserve || []),
            ];

            // Find all the corresponding entities
            const allEntities = await playerRepo.findByIds(allIds);

            // Separate them back into their original categories
            const players = allEntities.filter((player) => roster.players?.includes(player.player_id));
            const starters = allEntities.filter((player) => roster.starters?.includes(player.player_id));
            const reserves = allEntities.filter((player) => roster.reserve?.includes(player.player_id));

            if (rosterEntity) {
                // If the roster exists, update the fields
                rosterEntity.settings = roster.settings;
                rosterEntity.roster_id = roster.roster_id;
                rosterEntity.starters = starters;
                rosterEntity.players = players;
                rosterEntity.reserve = reserves;
            } else {
                // If the roster doesn't exist, create a new one
                rosterEntity = new SleeperRosterEntity();
                rosterEntity.owner_id = roster.owner_id;
                rosterEntity.league_id = DYNASTY_TEST_ID; // replace with the actual league_id
                rosterEntity.roster_id = roster.roster_id;
                rosterEntity.settings = roster.settings;
                rosterEntity.starters = starters;
                rosterEntity.players = players;
                rosterEntity.reserve = reserves;
            }

            // Save the updated or new roster
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
}
