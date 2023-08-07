export interface SleeperRoster {
    starters: string[]; // player ids?
    settings: {
        wins: number;
        waiver_position: number;
        waiver_budget_used: number;
        total_moves: number;
        ties: number;
        losses: number;
        fpts_decimal: number;
        fpts_against_decimal: number;
        fpts_against: number;
        fpts: number;
    };
    roster_id: number;
    reserve: any[]; // player ids?
    players: string[]; // player ids?
    owner_id: string; // sleeperuserentity -> user_id
}
