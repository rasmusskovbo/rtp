import { Router, Request, Response } from 'express';
import { ArticleConfigService } from '../services/ArticleConfigService';
import { fetchAndSaveMatchupArticle } from '../services/OpenAPIService';

const articleRouter = Router();

// Get current article generation configuration
articleRouter.get('/config', (req: Request, res: Response) => {
    try {
        const config = ArticleConfigService.getConfig();
        res.json({
            success: true,
            config: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get article configuration'
        });
    }
});

// Update article generation configuration
articleRouter.post('/config', (req: Request, res: Response) => {
    try {
        const updates = req.body;
        const updatedConfig = ArticleConfigService.updateConfig(updates);
        
        res.json({
            success: true,
            config: updatedConfig,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update article configuration'
        });
    }
});

// Generate pre-matchup article with custom configuration
articleRouter.post('/generate/pre', async (req: Request, res: Response) => {
    try {
        const customConfig = req.body.config;
        
        if (customConfig) {
            // Temporarily update config for this generation
            const originalConfig = ArticleConfigService.getConfig();
            ArticleConfigService.updateConfig(customConfig);
        }
        
        const result = await fetchAndSaveMatchupArticle("pre");
        
        res.json({
            success: true,
            message: 'Pre-matchup article generated successfully',
            articleId: result?.choices?.[0]?.message?.content?.substring(0, 100) + '...'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate pre-matchup article',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Generate post-matchup article with custom configuration
articleRouter.post('/generate/post', async (req: Request, res: Response) => {
    try {
        const customConfig = req.body.config;
        
        if (customConfig) {
            // Temporarily update config for this generation
            const originalConfig = ArticleConfigService.getConfig();
            ArticleConfigService.updateConfig(customConfig);
        }
        
        const result = await fetchAndSaveMatchupArticle("post");
        
        res.json({
            success: true,
            message: 'Post-matchup article generated successfully',
            articleId: result?.choices?.[0]?.message?.content?.substring(0, 100) + '...'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate post-matchup article',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get available configuration presets
articleRouter.get('/config/presets', (req: Request, res: Response) => {
    try {
        const presets = {
            default: ArticleConfigService.getConfig(),
            preMatchup: ArticleConfigService.getPreMatchupConfig(),
            postMatchup: ArticleConfigService.getPostMatchupConfig(),
            minimal: ArticleConfigService.getMinimalConfig(),
            comprehensive: ArticleConfigService.getComprehensiveConfig()
        };
        
        res.json({
            success: true,
            presets: presets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get configuration presets'
        });
    }
});

// Test endpoint to see what data is being collected
articleRouter.get('/test-data', async (req: Request, res: Response) => {
    try {
        const { getMatchupsForCurrentWeek } = await import('../services/MatchupsService');
        const { getRepository } = await import('typeorm');
        const { CurrentWeekEntity } = await import('../database/entities/CurrentWeekEntity');
        const { getPlayerStats, getPlayerProjections, getLeagueInfo } = await import('../clients/SleeperClient');
        
        // Get matchup data
        const matchupData = await getMatchupsForCurrentWeek();
        
        // Get current week
        const nflWeekRepository = getRepository(CurrentWeekEntity);
        const currentWeekEntity = await nflWeekRepository.find();
        const currentWeek = currentWeekEntity[0].weekNumber;
        
        // Test Sleeper API calls
        let playerStats = null;
        let playerProjections = null;
        let leagueInfo = null;
        
        try {
            playerStats = await getPlayerStats("2024", currentWeek);
        } catch (error) {
            console.log("Player stats error:", error);
        }
        
        try {
            playerProjections = await getPlayerProjections("2024", currentWeek);
        } catch (error) {
            console.log("Player projections error:", error);
        }
        
        try {
            leagueInfo = await getLeagueInfo();
        } catch (error) {
            console.log("League info error:", error);
        }
        
        res.json({
            success: true,
            data: {
                currentWeek,
                matchupCount: matchupData.length,
                matchups: matchupData.map(m => ({
                    id: m.id,
                    matchup_id: m.matchup_id,
                    week: m.week,
                    home_team: m.home_team?.team?.teamName || 'Unknown',
                    away_team: m.away_team?.team?.teamName || 'Unknown',
                    home_points: m.home_team_points,
                    away_points: m.away_team_points,
                    winner: m.winner?.team?.teamName || null,
                })),
                sleeperData: {
                    playerStatsCount: Object.keys(playerStats || {}).length,
                    playerProjectionsCount: Object.keys(playerProjections || {}).length,
                    hasLeagueInfo: !!leagueInfo,
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to test data collection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default articleRouter;