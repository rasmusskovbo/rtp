import { getChat } from "../clients/OpenAPIClient";
import { getMatchupsForCurrentWeek } from "./MatchupsService";
import { MatchupEntity } from "../database/entities/MatchupEntity";
import { SleeperRosterEntity } from "../database/entities/SleeperRosterEntity";
import { getRepository } from "typeorm";
import { ContentType, PostsEntity } from "../database/entities/PostEntity";
import { CurrentWeekEntity } from "../database/entities/CurrentWeekEntity";

const sharedInstructions =
    "You are a journalist writing articles about a serious fantasy football league." +
    "It is important the tone is serious, as if the fantasy football league was a real sports league. Write the article as if it were two team's in the NFL." +
    "Make it as personal as possible using fx the team name, manager name, and mascot in your story line. Even though some of the source data might be silly, keep the tone serious, so avoid using their silly bios." +
    "It is not required to methodologically list the team name, manager name and mascot - mention them only for bring some rivalry flair to the article." +
    "It is very important that you do NOT misrepresent players, in the sense of what team has which players." +
    "Include serious, strategic replies from the 'managers' of the teams, as if you interviewed them in real time." +
    "It is important that you touch on every matchup evenly, within the character limit." +
    "Write a very short intro for the week, before presenting your analysis of each matchup." +
    "Keep your article to max 5000 characters." +
    "Note that the frontend is using React-Markdown. Stylize accordingly.";

const preweekInstructions =
    "The article you must write now is a pre-matchup article, i.e. give an overview with an interesting story line per matchup." +
    "Highlight any positions where you think one team might have an advantage." +
    "Analyze how a win or loss might affect each team in its hunt for the playoffs or ending up last place in the league." +
    "Ending last will most likely be the team with 4 or fewer wins. Ending last is called 'getting Pink'" +
    "Reaching playoffs will most likely require 6 or 7 wins" +
    "Pull on your knowledge of NFL fantasy football, for example how the quarterbacks, running backs, wide receivers, and tight ends from each team match up." +
    "Make note of any 'stacks', such as QB and WR from the same team, or several star players on one position." +
    "Mention if any players are injured and will not be available for the matchup." +
    "End every matchup review with your projected winner and explain shortly why.";

const postWeekInstructions =
    "The article you must write now is a post-matchup article, so look at the winner of the matchup." +
    "Focus on the rivalry between the teams." +
    "Adjust the interview responses so that the winner often seems very cocky and arrogant in a playful way" +
    "The loser of the matchup should be making bad excuses as to why they didn't win the matchup." +
    "End the analysis of each matchup by looking at the total wins and losses of each team and how that might affect the playoff race." +
    "A team will most likely reach the playoff with 6 or 7 wins after 14 weeks." +
    "A team will most likely be in last place in the regular season with 4 or fewer wins." +
    "Being in last place will get you 'Pink', and is something every team wants to avoid." +
    "After analyzing all matchups, conclude the article with your current projections for league winner (in the playoffs) and league loser ('Pink', most losses in regular season').";

export async function fetchAndSaveMatchupArticle(articleType: "pre" | "post") {
    // Get the repository for the NFLWeek entity
    const nflWeekRepository = getRepository(CurrentWeekEntity);

    // Find the current NFL week
    const currentWeekEntity = await nflWeekRepository.find();
    const currentWeek = currentWeekEntity[0].weekNumber;

    const instructions =
        articleType === "pre" ? preweekInstructions : postWeekInstructions;

    const chatCompletion = await getMatchupChatResponse(instructions);

    const article = chatCompletion.choices[0].message.content;

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

async function getMatchupChatResponse(instructions: string) {
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
    const promptData = matchupData.map((matchup) => {
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
                teamData.starters = team.starters.map((player) => ({
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
        };
    });

    // Serialize the prompt data to a JSON string
    const dataString = JSON.stringify({ matchups: promptData }, null, 2);

    return await getChat(dataString, sharedInstructions + " " + instructions);
}

export async function fetchAndSavePreMatchupArticle() {
    return await fetchAndSaveMatchupArticle("pre");
}

export async function fetchAndSavePostMatchupArticle() {
    return await fetchAndSaveMatchupArticle("post");
}