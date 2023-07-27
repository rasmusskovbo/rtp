// statsTypes.ts

interface AllTimeWinnersStats {
    id: number,
    avatar: string,
    sleeper_username: string,
    rtpScore: number,
    wins: number,
    second_place: number,
    third_place: number,
    playoff_appearances: number,
    toilet_wins: number,
    pinks: number
}

export interface AllTimeWinnersProps {
    stats: AllTimeWinnersStats[];
}

// TODO change names to match DB data structure
// applay avatar css
interface AllTimeStandingsStats {
    id: number,
    avatar: string,
    sleeper_username: string,
    record: number,
    win_p: number,
    pf: number,
    pa: number,
    diff: number,
    trans: number,
    msgs: number
}

export interface AllTimeStandingsProps {
    stats: AllTimeStandingsStats[];
}

interface WeeklyHighScoresStats {
    id: number,
    avatar: string,
    sleeper_username: string,
    score: number,
    year: number,
    week: number,
}

export interface WeeklyHighScoresProps {
    stats: WeeklyHighScoresStats[];
}

interface PlayerHighScoresStats {
    id: number,
    avatar: string,
    sleeper_username: string,
    player_name: string,
    score: number,
    year: number,
    week: number,
}

export interface PlayerHighScoresProps {
    stats: PlayerHighScoresStats[];
}

interface YearlyFinishesStats {
    id: number,
    year: number,
    winner: string,
    second: string,
    third: string,
    last_regular: string,
    last_playoffs: string,
    league_size: number
}

export interface YearlyFinishesProps {
    stats: YearlyFinishesStats[];
}

interface RtpStatsTypes {
    allTimeWinners: AllTimeWinnersProps;
    allTimeStandings: AllTimeStandingsProps;
    weeklyHighScores: WeeklyHighScoresProps;
    playerHighScores: PlayerHighScoresProps;
    yearlyFinishes: YearlyFinishesProps;
}

export interface RtpStatsProps {
    statProps: RtpStatsTypes
}
