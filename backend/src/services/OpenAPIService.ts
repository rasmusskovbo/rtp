import {getChat} from "../clients/OpenAPIClient";
import {getMatchupsForCurrentWeek} from "./MatchupsService";
import {MatchupEntity} from "../database/entities/MatchupEntity";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {getRepository} from "typeorm";
import {ContentType, PostsEntity} from "../database/entities/PostEntity";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";

const preweekInstructions =
    "You are a journalist writing articles about a serious fantasy football league." +
    "It is important the tone is serious, as if the fantasy football league was a real sports league. Write the article as if it were two team's in the NFL" +
    "The article is a pre-matchup article, i.e. give an overview with an interesting story line per matchup." +
    "Make it as personal as possible using fx the team name, manager name, and mascot in your story line. Even though some of the source data might be silly, keep the tone serious, so avoid using their silly bios" +
    "It is not required to methodologically list the team name, manager name and mascot - mention them only for bring some rivalry flair to the article." +
    "Include serious, strategic replies from the 'managers' of the teams, as if you interviewed them in real time" +
    "Highlight any positions where you think one team might have an advantage, for example one team's QB is project to score much higher than the other's" +
    "Keep your article to max 5000 characters." +
    "It is important that you touch on every matchup evenly, within the character limit" +
    "Write a very short intro for each week, before presenting each matchup" +
    "End every matchup review with your projected winner and explain shortly why" +
    "Note that the frontend is using React-Markdown. Stylize accordingly.npm";

const postWeekInstructions = "You are an expert data analyst. Provide detailed insights based on the data provided.";

export async function fetchAndSavePreMatchupArticle() {
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find()
    const currentWeek = currentWeekEntity[0].weekNumber;

    const chatCompletion = await getPreMatchupChatResponse();

    const article = chatCompletion.choices[0].message.content;

    const postsRepository = getRepository(PostsEntity);
    const newPost = new PostsEntity();
    newPost.title = "Road To Pink - Matchup Previews for Week " + currentWeek;
    newPost.author = "Scott Hanson";
    newPost.type = ContentType.TEXT;
    newPost.content = article;
    await postsRepository.save(newPost);

    return chatCompletion;

    async function getPreMatchupChatResponse() {
        const matchupData: MatchupEntity[] = await getMatchupsForCurrentWeek();

        // Configuration to include or exclude data fields
        const dataFieldsConfig = {
            includeTeamInfo: true,
            includeSettings: true,
            includeStarters: true,
            includePlayers: false,
            includeReserve: false,
        };

        // Process the matchup data and collect the prompt data
        const promptData = matchupData.map(matchup => {
            const homeTeam = matchup.home_team;
            const awayTeam = matchup.away_team;

            // Function to collect team data based on configuration
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
                }

                if (dataFieldsConfig.includeStarters && team.starters) {
                    teamData.starters = team.starters.map(player => ({
                        player_id: player.player_id,
                        first_name: player.first_name,
                        last_name: player.last_name,
                        position: player.position,
                        team: player.team,
                        injury_status: player.injury_status,
                    }));
                }

                // Include players and reserve if configured
                return teamData;
            };

            return {
                matchup_id: matchup.matchup_id,
                week: matchup.week,
                home_team: getTeamData(homeTeam),
                away_team: getTeamData(awayTeam),
            };
        });

        // Serialize the prompt data to a JSON string
        const dataString = JSON.stringify({matchups: promptData}, null, 2);

        return await getChat(dataString, preweekInstructions);
    }
}