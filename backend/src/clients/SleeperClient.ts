import axios from 'axios';
import {SleeperRoster} from "../models/SleeperRoster";
import {PlayerEntity} from "../database/entities/PlayerEntity";

const BASEURL_SLEEPER: string = "https://api.sleeper.app/v1/";

export interface SleeperUser {
    username: string,
    user_id: string,
    display_name: string,
    avatar: string
}

export async function getSleeperUserByUsername(sleeperUserName: string): Promise<SleeperUser> {
    const url: string = BASEURL_SLEEPER + "user/" + sleeperUserName;
    const response = await axios.get<SleeperUser>(url);
    return response.data;
}

export async function getRostersByLeagueId(id: string): Promise<SleeperRoster[]> {
    const url: string = BASEURL_SLEEPER + "league/" + id + '/rosters';
    const response = await axios.get<SleeperRoster[]>(url);
    return response.data;
}

export async function fetchAllPlayers(): Promise<PlayerEntity[]> {
    const url: string = BASEURL_SLEEPER + "players/nfl";
    const response = await axios.get<PlayerEntity[]>(url);
    return response.data;
}

