export interface ArticleGenerationConfig {
    // Data inclusion settings
    includeTeamInfo: boolean;
    includeSettings: boolean;
    includeStarters: boolean;
    includePlayers: boolean;
    includeReserve: boolean;
    includeStats: boolean;
    includeProjections: boolean;
    includeLeagueStandings: boolean;
    
    // Article settings
    maxCharacters: number;
    minValidationScore: number;
    maxRegenerationAttempts: number;
    
    // Content settings
    includeManagerQuotes: boolean;
    includePredictions: boolean;
    includePlayoffContext: boolean;
    includeStatisticalAnalysis: boolean;
    
    // Sleeper API settings
    sleeperSeason: string;
    enableSleeperProjections: boolean;
    enableSleeperStats: boolean;
}

export class ArticleConfigService {
    private static defaultConfig: ArticleGenerationConfig = {
        // Data inclusion settings
        includeTeamInfo: true,
        includeSettings: true,
        includeStarters: true,
        includePlayers: false,
        includeReserve: false,
        includeStats: true,
        includeProjections: true,
        includeLeagueStandings: true,
        
        // Article settings
        maxCharacters: 7000,
        minValidationScore: 80,
        maxRegenerationAttempts: 3,
        
        // Content settings
        includeManagerQuotes: true,
        includePredictions: true,
        includePlayoffContext: true,
        includeStatisticalAnalysis: true,
        
        // Sleeper API settings
        sleeperSeason: "2025",
        enableSleeperProjections: true,
        enableSleeperStats: true,
    };

    public static getConfig(): ArticleGenerationConfig {
        return { ...this.defaultConfig };
    }

    public static updateConfig(updates: Partial<ArticleGenerationConfig>): ArticleGenerationConfig {
        return { ...this.defaultConfig, ...updates };
    }

    public static getPreMatchupConfig(): ArticleGenerationConfig {
        return {
            ...this.defaultConfig,
            includeProjections: true,
            includeStats: false, // Use projections for pre-matchup
            includeStatisticalAnalysis: true,
        };
    }

    public static getPostMatchupConfig(): ArticleGenerationConfig {
        return {
            ...this.defaultConfig,
            includeProjections: false, // Use actual stats for post-matchup
            includeStats: true,
            includeStatisticalAnalysis: true,
        };
    }

    public static getMinimalConfig(): ArticleGenerationConfig {
        return {
            ...this.defaultConfig,
            includeStats: false,
            includeProjections: false,
            includeLeagueStandings: false,
            maxCharacters: 5000,
            minValidationScore: 70,
        };
    }

    public static getComprehensiveConfig(): ArticleGenerationConfig {
        return {
            ...this.defaultConfig,
            includeStats: true,
            includeProjections: true,
            includeLeagueStandings: true,
            includePlayers: true,
            includeReserve: true,
            maxCharacters: 8000,
            minValidationScore: 85,
        };
    }
}