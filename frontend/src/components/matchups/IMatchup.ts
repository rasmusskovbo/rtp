export interface Matchup {
    id: number;
    matchup_id: number;
    week: number;
    home_team: Team;
    away_team: Team;
    voteTotals: VoteTotals;
}

interface Team {
    id: number;
    owner_id: string;
    league_id: string;
    roster_id: number;
    settings: TeamSettings;
    starters: Player[];
    team: TeamDetails;
}

interface VoteTotals {
    homeTeam: number,
    awayTeam: number
}

interface TeamSettings {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts: number;
}

interface Player {
    player_id: string;
    status: string;
    sport: string;
    number: number;
    position: string;
    team: string;
    last_name: string;
    college: string;
    injury_status: string | null;
    age: number;
    first_name: string;
    years_exp: number;
}

interface TeamDetails {
    id: number;
    sleeperUsername: string;
    teamName: string;
    ownerName: string;
    nationality: string;
    teamMascot: string;
    yearsInLeague: number;
    bio: string;
    teamLogo: string;
    ownerImage: string;
}
