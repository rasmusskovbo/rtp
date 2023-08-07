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
const ROSTER_EXPIRATION = 60 * 60 * 24 * 2; // 2 Days
const SLEEPER_LEAGUE_ID = "976587245010333696";
const DYNASTY_TEST_ID = "917218485867139072";

export class SleeperService {
    private cache: RedisCache;

    constructor() {
        this.cache = new RedisCache();
    }

    public async getSleeperAvatarUrlBySleeperUsername(username: string): Promise<string> {
        const cachedAvatarUrl = await this.cache.get(username, CACHE_FIELD)

        return cachedAvatarUrl ? cachedAvatarUrl : await this.fetchAndInsertSleeperUser(username)
    }

    private async fetchAndInsertSleeperUser(username: string): Promise<string> {
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
    public async fetchAndUpsertRosters(ownerId: string): Promise<SleeperRosterEntity> {
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
            console.log("DATABASE HIT. Updating Sleeper Players...")
            // Update players in database
            await this.fetchAndSavePlayers();

            // fetch roster again but with updated player info
            console.log("Fetching updated roster from database...")
            roster = await repo.findOne({ where: { owner_id: ownerId } }) as SleeperRosterEntity;

            // todo need to update roster here as well. otherwise active roster id of players will quickly become outdated.
            console.log("Caching updated roster...")
            // cache the updated roster
            this.cache.putObject(ownerId, roster!, AVATAR_EXPIRATION, CACHE_FIELD);

            console.log("Returning updated roster.")
            return roster;
        }

        // todo we shouldndt call the roster endpoint for every single team. it should be called once before hand and results saved
        // If we're here, there was no cache hit in memory or database
        // Fetching from the API
        console.log("NO CACHE HIT. NO DATABASE HIT.")
        console.log("Fetching rosters from Sleeper API...")
        const rosters : SleeperRoster[] = await getRostersByLeagueId(SLEEPER_LEAGUE_ID);

        // Finding the roster for the team
        const sleeperRoster = rosters.find(r => r.owner_id === ownerId);

        if (sleeperRoster) {
            roster = new SleeperRosterEntity();
            const playerRepository = getRepository(PlayerEntity);

            // Get latest players
            await this.fetchAndSavePlayers();

            // Here you should fill your entity with the data fetched from the API
            roster.owner_id = sleeperRoster.owner_id;
            roster.league_id = SLEEPER_LEAGUE_ID;
            roster.roster_id = sleeperRoster.roster_id;
            roster.players = await playerRepository.findByIds(sleeperRoster.players);
            roster.starters = await playerRepository.findByIds(sleeperRoster.players);
            roster.reserve = await playerRepository.findByIds(sleeperRoster.players);
            roster.settings = sleeperRoster.settings;

            await repo.save(roster);

            // Updating the cache
            this.cache.putObject(ownerId, roster, AVATAR_EXPIRATION, CACHE_FIELD);

            return roster;
        }

        // If we're here, we couldn't find the team roster in the API response
        // Handle this case as you see fit
        throw new Error(`Unable to find roster for ownerId ${ownerId}`);
    }

    private async fetchAndSavePlayers(): Promise<void> {
        const sleeperPlayers = await fetchAllPlayers();

        // Get the repository for PlayerEntity
        const playerRepository = getRepository(PlayerEntity);

        // Save the players in the database
        await playerRepository.save(sleeperPlayers);
    }
}
