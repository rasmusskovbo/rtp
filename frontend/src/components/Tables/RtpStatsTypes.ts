// statsTypes.ts

interface AllTimeWinnersStats {
    avatar: string,
    sleeperUser: string,
    rtpScore: number,
    wins: number,
    secondPlaces: number,
    thirdPlaces: number,
    playoffAppearances: number,
    toiletBowlWins: number,
    pinkFinishes: number
}

export interface AllTimeWinnersProps {
    stats: AllTimeWinnersStats[];
}

interface AllTimeStandingsStats {
    avatar: string,
    sleeperUser: string,
    record: number,
    winPercent: number,
    pointsFor: number,
    pointsAgainst: number,
    difference: number,
    transactions: number,
    messages: number
}

export interface AllTimeStandingsProps {
    stats: AllTimeStandingsStats[];
}

interface WeeklyHighScoresStats {
    avatar: string,
    sleeperUser: string,
    score: number,
    year: number,
    week: number,
}

export interface WeeklyHighScoresProps {
    stats: WeeklyHighScoresStats[];
}

interface PlayerHighScoresStats {
    avatar: string,
    sleeperUser: string,
    playerName: number,
    score: number,
    year: number,
    week: number,
}

export interface PlayerHighScoresProps {
    stats: PlayerHighScoresStats[];
}

interface YearlyFinishesStats {
    year: number,
    winner: string,
    secondPlace: string,
    thirdPlace: string,
    lastPlaceRegular: string,
    lastPlacePlayoffs: string,
    leagueSize: number
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
