import { getChat } from "../clients/OpenAPIClient";
import { getMatchupsForCurrentWeek } from "./MatchupsService";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import { SleeperRosterEntity } from "../database/entities/SleeperRosterEntity";
import { getRepository } from "typeorm";
import { ContentType, PostsEntity } from "../database/entities/PostEntity";
import { CurrentWeekEntity } from "../database/entities/CurrentWeekEntity";
import { getLeagueInfo, getPlayerStats, getPlayerProjections } from "../clients/SleeperClient";
import { ArticleValidationService } from "./ArticleValidationService";
import { ArticleConfigService, ArticleGenerationConfig } from "./ArticleConfigService";

const sharedInstructions =
    "You are a professional sports journalist writing articles about a serious fantasy football league called 'Road To Pink'." +
    "Write with the tone and professionalism of NFL coverage, treating this fantasy league as a legitimate sports league." +
    "CRITICAL STRUCTURE REQUIREMENTS:" +
    "1. Always start with a compelling headline and brief intro (2-3 sentences)" +
    "2. Use ## for matchup headers (e.g., '## Team A vs Team B')" +
    "3. Include **bold** for key statistics and player names" +
    "4. End each matchup with a clear winner prediction" +
    "5. Use bullet points (-) for key insights" +
    "6. Include manager quotes in italics (*quote*)" +
    "7. End with a league standings update and playoff implications" +
    "PERSONALIZATION:" +
    "Use team names, manager names, and mascots naturally in storylines for rivalry flair." +
    "Avoid silly bios - keep tone serious and professional." +
    "ACCURACY:" +
    "Never misrepresent which players belong to which teams." +
    "Include strategic manager quotes as if conducting real interviews." +
    "COVERAGE:" +
    "Cover every matchup evenly within the character limit." +
    "Maximum 7000 characters - prioritize comprehensive coverage." +
    "FORMATTING:" +
    "Use React-Markdown compatible formatting." +
    "Include relevant statistics and projections when available.";

const preweekInstructions =
    "PRE-MATCHUP ANALYSIS REQUIREMENTS:" +
    "**Article Structure:**" +
    "1. Compelling intro highlighting key storylines for the week" +
    "2. For each matchup, analyze:" +
    "   - **Positional Advantages:** QB, RB, WR, TE, K, DEF matchups" +
    "   - **Key Players:** Highlight star players and their recent performance" +
    "   - **Injury Report:** Note any injured/unavailable players" +
    "   - **Stack Analysis:** Identify QB-WR/TE stacks and their impact" +
    "   - **Statistical Edge:** Use team records, points scored/allowed" +
    "   - **Manager Quote:** Include strategic insight from each manager" +
    "   - **Prediction:** Clear winner with 2-3 sentence reasoning" +
    "3. League standings update and playoff implications" +
    "**Fantasy Football Logic:**" +
    "Analyze positional matchups using NFL knowledge (QB vs defense, RB vs run defense, etc.)" +
    "Consider recent performance trends and matchup advantages" +
    "Highlight players with favorable matchups or concerning situations" +
    "**Playoff Race Context:**" +
    "Teams need 6-7 wins to reach playoffs" +
    "Teams with 4 or fewer wins risk 'getting Pink' (last place)" +
    "Emphasize how each game affects playoff positioning" +
    "**Statistical Focus:**" +
    "Use team records, points for/against, and recent performance" +
    "Include relevant player statistics when available" +
    "Reference injury status and its impact on lineups";

const postWeekInstructions =
    "POST-MATCHUP RECAP REQUIREMENTS:" +
    "**Article Structure:**" +
    "1. Brief intro summarizing the week's key results" +
    "2. For each matchup, analyze:" +
    "   - **Final Score:** Include actual points scored by each team" +
    "   - **Key Performers:** Highlight players who exceeded/fell short of expectations" +
    "   - **Turning Points:** Identify plays or decisions that decided the outcome" +
    "   - **Manager Reactions:** Winner gets cocky/confident quotes, loser makes excuses" +
    "   - **Statistical Analysis:** Compare projected vs actual performance" +
    "   - **Standings Impact:** How the result affects playoff positioning" +
    "3. Updated league standings and playoff implications" +
    "4. Final projections for season outcomes" +
    "**Tone and Style:**" +
    "Winners should be cocky and arrogant in a playful way" +
    "Losers should make humorous excuses for their poor performance" +
    "Maintain rivalry focus while keeping it entertaining" +
    "**Statistical Focus:**" +
    "Include actual scoring data and performance metrics" +
    "Compare results to pre-game expectations" +
    "Highlight surprising performances (positive and negative)" +
    "**Playoff Implications:**" +
    "Teams need 6-7 wins for playoffs" +
    "Teams with 4 or fewer wins risk 'getting Pink'" +
    "Update playoff probability based on current records" +
    "**Season Projections:**" +
    "Predict likely playoff teams and 'Pink' candidate" +
    "Base projections on current records and remaining schedule" +
    "Consider team performance trends and remaining matchups";

export async function fetchAndSaveMatchupArticle(articleType: "pre" | "post") {
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0].weekNumber;

    const instructions =
        articleType === "pre" ? preweekInstructions : postWeekInstructions;

    // Use appropriate configuration for article type
    const config = articleType === "pre" 
        ? ArticleConfigService.getPreMatchupConfig() 
        : ArticleConfigService.getPostMatchupConfig();

    const chatCompletion = await getMatchupChatResponse(instructions, config);

    let article = chatCompletion.choices[0].message.content;

    // Validate and potentially regenerate the article
    console.log("Validating generated article...");
    const validation = await ArticleValidationService.validateArticle(article, articleType);
    
    if (!validation.isValid || validation.score < config.minValidationScore) {
        console.log(`Article validation failed. Score: ${validation.score} (min: ${config.minValidationScore})`);
        console.log("Issues:", validation.issues);
        console.log("Suggestions:", validation.suggestions);
        
        // Try to regenerate with improved instructions
        const improvedInstructions = instructions + 
            "\n\nIMPORTANT: Address these validation issues: " + 
            validation.issues.join(", ") + 
            "\nSuggestions: " + 
            validation.suggestions.join(", ");
        
        try {
            const retryCompletion = await getMatchupChatResponse(improvedInstructions, config);
            const retryArticle = retryCompletion.choices[0].message.content;
            
            // Validate the retry
            const retryValidation = await ArticleValidationService.validateArticle(retryArticle, articleType);
            if (retryValidation.score > validation.score) {
                article = retryArticle;
                console.log(`Article improved. New score: ${retryValidation.score}`);
            }
        } catch (error) {
            console.log("Failed to regenerate article:", error);
        }
    } else {
        console.log(`Article validation passed. Score: ${validation.score}`);
    }

    const postsRepository = getRepository(PostsEntity);
    const newPost = new PostsEntity();
    newPost.title =
        "Road To Pink - Matchup " +
        (articleType === "pre" ? "Previews" : "Recaps") +
        " for Week " +
        currentWeek;
    newPost.author = "Scott Hanson";
    newPost.type = ContentType.TEXT;
    newPost.content = article;
    await postsRepository.save(newPost);

    return chatCompletion;
}

async function getMatchupChatResponse(instructions: string, config?: ArticleGenerationConfig) {
    // Get actual matchup data from database with all relations
    const matchupData: MatchupEntity[] = await getMatchupsForCurrentWeek();
    
    if (!matchupData || matchupData.length === 0) {
        throw new Error("No matchup data found for current week. Please ensure matchups are updated.");
    }
    
    // Get current week for stats/projections
    const nflWeekRepository = getRepository(CurrentWeekEntity);
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0].weekNumber;
    
    // Use provided config or default
    const dataFieldsConfig = config || ArticleConfigService.getConfig();

    // Fetch additional statistical data based on configuration
    let playerStats = null;
    let playerProjections = null;
    let leagueInfo = null;

    try {
        if (dataFieldsConfig.enableSleeperStats && dataFieldsConfig.includeStats) {
            playerStats = await getPlayerStats(dataFieldsConfig.sleeperSeason, currentWeek);
            console.log(`Fetched player stats for ${Object.keys(playerStats || {}).length} players`);
        }
        if (dataFieldsConfig.enableSleeperProjections && dataFieldsConfig.includeProjections) {
            playerProjections = await getPlayerProjections(dataFieldsConfig.sleeperSeason, currentWeek);
            console.log(`Fetched player projections for ${Object.keys(playerProjections || {}).length} players`);
        }
        if (dataFieldsConfig.includeLeagueStandings) {
            leagueInfo = await getLeagueInfo();
        }
    } catch (error) {
        console.log("Warning: Could not fetch additional Sleeper data:", error);
    }

    // Process the matchup data and collect the prompt data
    const promptData = matchupData.map((matchup) => {
        const homeTeam = matchup.home_team;
        const awayTeam = matchup.away_team;

        // Enhanced function to collect team data with statistics
        const getTeamData = (team: SleeperRosterEntity | null) => {
            if (!team) return null;
            const teamData: any = {};

            if (dataFieldsConfig.includeTeamInfo && team.team) {
                teamData.teamInfo = {
                    sleeperUsername: team.team.sleeperUsername,
                    teamName: team.team.teamName,
                    ownerName: team.team.ownerName,
                    nationality: team.team.nationality,
                    teamMascot: team.team.teamMascot,
                    yearsInLeague: team.team.yearsInLeague,
                    bio: team.team.bio,
                    teamLogo: team.team.teamLogo,
                    ownerImage: team.team.ownerImage,
                };
            }

            if (dataFieldsConfig.includeSettings) {
                teamData.settings = team.settings;
                // Add calculated metrics
                teamData.record = `${team.settings.wins}-${team.settings.losses}${team.settings.ties > 0 ? `-${team.settings.ties}` : ''}`;
                teamData.pointsFor = team.settings.fpts;
                teamData.pointsAgainst = team.settings.fpts_against;
                teamData.pointDifferential = team.settings.fpts - team.settings.fpts_against;
                teamData.totalMoves = team.settings.total_moves;
                teamData.waiverPosition = team.settings.waiver_position;
            }

            if (dataFieldsConfig.includeStarters && team.starters) {
                teamData.starters = team.starters.map((player) => {
                    const playerData: any = {
                        player_id: player.player_id,
                        first_name: player.first_name,
                        last_name: player.last_name,
                        position: player.position,
                        team: player.team,
                        injury_status: player.injury_status,
                        status: player.status,
                        age: player.age,
                        years_exp: player.years_exp,
                        college: player.college,
                        number: player.number,
                    };

                    // Add real stats from Sleeper API if available
                    if (playerStats && playerStats[player.player_id]) {
                        const stats = playerStats[player.player_id];
                        playerData.recentStats = {
                            passing_yards: stats.passing_yards || 0,
                            passing_tds: stats.passing_tds || 0,
                            passing_ints: stats.passing_ints || 0,
                            rushing_yards: stats.rushing_yards || 0,
                            rushing_tds: stats.rushing_tds || 0,
                            receiving_yards: stats.receiving_yards || 0,
                            receiving_tds: stats.receiving_tds || 0,
                            receiving_rec: stats.receiving_rec || 0,
                            fumbles_lost: stats.fumbles_lost || 0,
                            fantasy_points: stats.fantasy_points || 0,
                        };
                    }

                    // Add projections from Sleeper API if available
                    if (playerProjections && playerProjections[player.player_id]) {
                        const projections = playerProjections[player.player_id];
                        playerData.projectedPoints = {
                            passing_yards: projections.passing_yards || 0,
                            passing_tds: projections.passing_tds || 0,
                            passing_ints: projections.passing_ints || 0,
                            rushing_yards: projections.rushing_yards || 0,
                            rushing_tds: projections.rushing_tds || 0,
                            receiving_yards: projections.receiving_yards || 0,
                            receiving_tds: projections.receiving_tds || 0,
                            receiving_rec: projections.receiving_rec || 0,
                            fumbles_lost: projections.fumbles_lost || 0,
                            fantasy_points: projections.fantasy_points || 0,
                        };
                    }

                    return playerData;
                });
            }

            // Include bench players if configured
            if (dataFieldsConfig.includePlayers && team.players) {
                teamData.benchPlayers = team.players.map((player) => ({
                    player_id: player.player_id,
                    first_name: player.first_name,
                    last_name: player.last_name,
                    position: player.position,
                    team: player.team,
                    injury_status: player.injury_status,
                }));
            }

            return teamData;
        };

        return {
            matchup_id: matchup.matchup_id,
            week: matchup.week,
            home_team: getTeamData(homeTeam),
            away_team: getTeamData(awayTeam),
            // Include actual matchup scores if available
            home_team_points: matchup.home_team_points,
            away_team_points: matchup.away_team_points,
            winner: matchup.winner ? {
                id: matchup.winner.id,
                teamName: matchup.winner.team?.teamName,
                ownerName: matchup.winner.team?.ownerName
            } : null,
            // Include vote totals if available
            voteTotals: (matchup as any).voteTotals || null,
        };
    });

    // Create comprehensive data object with real matchup data
    const comprehensiveData = {
        matchups: promptData,
        leagueInfo: leagueInfo,
        currentWeek: currentWeek,
        currentSeason: dataFieldsConfig.sleeperSeason,
        additionalContext: {
            playoffThreshold: "6-7 wins",
            pinkThreshold: "4 or fewer wins",
            totalWeeks: 14,
            remainingWeeks: 14 - currentWeek + 1,
            totalMatchups: promptData.length,
        },
        dataQuality: {
            hasPlayerStats: !!playerStats,
            hasPlayerProjections: !!playerProjections,
            hasLeagueInfo: !!leagueInfo,
            playerStatsCount: Object.keys(playerStats || {}).length,
            playerProjectionsCount: Object.keys(playerProjections || {}).length,
        }
    };

    console.log(`Processing ${promptData.length} matchups for week ${currentWeek}`);
    console.log(`Data quality: Stats=${!!playerStats}, Projections=${!!playerProjections}, League=${!!leagueInfo}`);

    // Serialize the comprehensive data to a JSON string
    const dataString = JSON.stringify(comprehensiveData, null, 2);

    return await getChat(dataString, sharedInstructions + " " + instructions);
}

export async function fetchAndSavePreMatchupArticle() {
    return await fetchAndSaveMatchupArticle("pre");
}

export async function fetchAndSavePostMatchupArticle() {
    return await fetchAndSaveMatchupArticle("post");
}