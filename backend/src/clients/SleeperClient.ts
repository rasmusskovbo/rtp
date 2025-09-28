import axios from 'axios';
import {SleeperRosterModel} from "../models/SleeperRosterModel";
import {SleeperMatchupModel} from "../models/SleeperMatchupModel";
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

export async function getRostersByLeagueId(): Promise<SleeperRosterModel[]> {
    const url: string = BASEURL_SLEEPER + `league/${SLEEPER_LEAGUE_ID}/rosters`
    const response = await axios.get<SleeperRosterModel[]>(url);
    return response.data;
}

export async function fetchAllPlayers(): Promise<PlayerEntity[]> {
    const url: string = BASEURL_SLEEPER + "players/nfl";
    const response = await axios.get(url);
    return Object.values(response.data); // Convert the object into an array
}

export async function getMatchupsByWeek(week: number): Promise<SleeperMatchupModel[]> {
    const url: string = `${BASEURL_SLEEPER}league/${SLEEPER_LEAGUE_ID}/matchups/${week}`;
    const response = await axios.get<SleeperMatchupModel[]>(url);
    return response.data;
}

export async function getLeagueInfo(): Promise<any> {
    const url: string = `${BASEURL_SLEEPER}league/${SLEEPER_LEAGUE_ID}`;
    const response = await axios.get(url);
    return response.data;
}

export async function getLeagueUsers(): Promise<any[]> {
    const url: string = `${BASEURL_SLEEPER}league/${SLEEPER_LEAGUE_ID}/users`;
    const response = await axios.get(url);
    return response.data;
}

export async function getLeagueTransactions(week?: number): Promise<any[]> {
    const url: string = `${BASEURL_SLEEPER}league/${SLEEPER_LEAGUE_ID}/transactions${week ? `/${week}` : ''}`;
    const response = await axios.get(url);
    return response.data;
}

export async function getPlayerStats(season: string, week: number): Promise<any> {
    const url: string = `${BASEURL_SLEEPER}stats/nfl/${season}/${week}`;
    const response = await axios.get(url);
    return response.data;
}

export async function getPlayerProjections(season: string, week: number): Promise<any> {
    const url: string = `${BASEURL_SLEEPER}projections/nfl/${season}/${week}`;
    const response = await axios.get(url);
    return response.data;
}
