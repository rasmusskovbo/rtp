import axios from 'axios';
import {SleeperRoster} from "../models/SleeperRoster";
import {SleeperMatchup} from "../models/SleeperMatchup";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import {SLEEPER_LEAGUE_ID} from "../services/SleeperService";

const BASEURL_SLEEPER: string = "https://api.sleeper.app/v1/";

export interface SleeperUser {
    username: string,
    user_id: string,
    display_name: string,
    avatar: string
}

export async function doGetSleeperUserByUsername(sleeperUserName: string): Promise<SleeperUser> {
    const url: string = BASEURL_SLEEPER + "user/" + sleeperUserName;
    const response = await axios.get<SleeperUser>(url);
    return response.data;
}

export async function getRostersByLeagueId(): Promise<SleeperRoster[]> {
    const url: string = BASEURL_SLEEPER + `league/${SLEEPER_LEAGUE_ID}/rosters`
    const response = await axios.get<SleeperRoster[]>(url);
    return response.data;
}

export async function fetchAllPlayers(): Promise<PlayerEntity[]> {
    const url: string = BASEURL_SLEEPER + "players/nfl";
    const response = await axios.get(url);
    return Object.values(response.data); // Convert the object into an array
}

export async function getMatchupsByWeek(week: number): Promise<SleeperMatchup[]> {
    const url: string = `${BASEURL_SLEEPER}league/${SLEEPER_LEAGUE_ID}/matchups/${week}`;
    const response = await axios.get<SleeperMatchup[]>(url);
    return response.data;
}
