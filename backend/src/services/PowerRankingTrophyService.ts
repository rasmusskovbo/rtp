import { getRepository } from 'typeorm';
import { PowerRankingEntity } from '../database/entities/PowerRankingEntity';
import { TeamEntity } from '../database/entities/TeamEntity';
import { UserEntity } from '../database/entities/UserEntity';
import { SleeperUserEntity } from '../database/entities/SleeperUserEntity';
import { CurrentWeekEntity } from '../database/entities/CurrentWeekEntity';

export interface TrophyWinner {
    userId: string;
    username: string;
    teamName: string;
    value: number;
    description: string;
}

export interface TrophyData {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    winner: TrophyWinner | null;
}

export class PowerRankingTrophyService {
    /**
     * Get all trophy data for the current week
     */
    static async getAllTrophies(): Promise<TrophyData[]> {
        const currentWeek = await this.getCurrentWeekNumber();
        const allRankings = await this.getAllRankingsForWeek(currentWeek);
        
        const trophies: TrophyData[] = [
            // Bias & Self-Rating Trophies
            {
                id: 'biggest-homie',
                title: 'Biggest Homie',
                description: 'Largest difference between how you rank your own team vs. how others rank it',
                icon: '🏠',
                category: 'Bias & Self-Rating',
                winner: await this.getBiggestHomie(allRankings)
            },
            {
                id: 'harsh-self-critic',
                title: 'Realist',
                description: 'Smallest difference between your own team ranking and others',
                icon: '😤',
                category: 'Bias & Self-Rating',
                winner: await this.getHarshSelfCritic(allRankings)
            },
            // Volatility & Movement Trophies
            {
                id: 'biggest-drop',
                title: 'Biggest Drop',
                description: 'Team with largest rank drop since last week',
                icon: '📉',
                category: 'Volatility & Movement',
                winner: await this.getBiggestDrop(allRankings, currentWeek)
            },
            {
                id: 'biggest-rise',
                title: 'Biggest Rise',
                description: 'Team with largest rank improvement since last week',
                icon: '📈',
                category: 'Volatility & Movement',
                winner: await this.getBiggestRise(allRankings, currentWeek)
            },
            {
                id: 'yo-yo-master',
                title: 'Yo-Yo Master',
                description: 'Most volatile team (highest standard deviation in rankings over time)',
                icon: '🪀',
                category: 'Volatility & Movement',
                winner: await this.getYoYoMaster(allRankings, currentWeek)
            },
            {
                id: 'steady-eddie',
                title: 'Steady Eddie',
                description: 'Most consistent team (lowest standard deviation in rankings)',
                icon: '🛡️',
                category: 'Volatility & Movement',
                winner: await this.getSteadyEddie(allRankings, currentWeek)
            },

            // Ranking Behavior Trophies
            {
                id: 'contrarian',
                title: 'Contrarian',
                description: 'Most often ranks teams opposite to the consensus',
                icon: '🔄',
                category: 'Ranking Behavior',
                winner: await this.getContrarian(allRankings)
            },
            {
                id: 'consensus-builder',
                title: 'Consensus Builder',
                description: 'Most often agrees with the majority ranking',
                icon: '🤝',
                category: 'Ranking Behavior',
                winner: await this.getConsensusBuilder(allRankings)
            },
            {
                id: 'homer',
                title: 'Homer',
                description: 'Most biased toward certain teams (consistently ranks them higher than others)',
                icon: '🏈',
                category: 'Ranking Behavior',
                winner: await this.getHomer(allRankings)
            },
            {
                id: 'hater',
                title: 'Hater',
                description: 'Most biased against certain teams (consistently ranks them lower than others)',
                icon: '😡',
                category: 'Ranking Behavior',
                winner: await this.getHater(allRankings)
            },
        ];

        return trophies;
    }

    private static async getCurrentWeekNumber(): Promise<number> {
        const weekRepository = getRepository(CurrentWeekEntity);
        const currentWeekEntity = await weekRepository.find();
        if (!currentWeekEntity || currentWeekEntity.length === 0) {
            throw new Error('No current week found in database');
        }
        return currentWeekEntity[0].weekNumber;
    }

    private static async getAllRankingsForWeek(week: number): Promise<PowerRankingEntity[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        return await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .where('ranking.week = :week', { week })
            .getMany();
    }

    private static async getAllRankingsForTeam(teamId: number, week: number): Promise<PowerRankingEntity[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        return await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .where('ranking.teamId = :teamId', { teamId })
            .andWhere('ranking.week = :week', { week })
            .getMany();
    }

    private static async getAllRankingsForUser(userId: string, week: number): Promise<PowerRankingEntity[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        return await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .where('ranking.userId = :userId', { userId })
            .andWhere('ranking.week = :week', { week })
            .getMany();
    }

    // Bias & Self-Rating Trophies
    private static async getBiggestHomie(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxDifference = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            const ownTeamRanking = rankings.find(r => r.teamId === userTeam.id);
            if (!ownTeamRanking) continue;

            const otherRankings = allRankings.filter(r => r.teamId === userTeam.id && r.userId !== userId);
            if (otherRankings.length === 0) continue;

            const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
            const difference = averageOtherRanking - ownTeamRanking.rank;

            if (difference > maxDifference) {
                maxDifference = difference;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(difference * 100) / 100,
                    description: `Ranks own team ${Math.round(ownTeamRanking.rank * 100) / 100} vs others' ${Math.round(averageOtherRanking * 100) / 100}`
                };
            }
        }

        return winner;
    }

    private static async getHarshSelfCritic(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let minDifference = Infinity;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            const ownTeamRanking = rankings.find(r => r.teamId === userTeam.id);
            if (!ownTeamRanking) continue;

            const otherRankings = allRankings.filter(r => r.teamId === userTeam.id && r.userId !== userId);
            if (otherRankings.length === 0) continue;

            const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
            const difference = Math.abs(ownTeamRanking.rank - averageOtherRanking);

            if (difference < minDifference) {
                minDifference = difference;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(difference * 100) / 100,
                    description: `Only ${Math.round(difference * 100) / 100} difference from others' ${Math.round(averageOtherRanking * 100) / 100}`
                };
            }
        }

        return winner;
    }

    private static async getDelusionalOptimist(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxOptimism = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            const ownTeamRanking = rankings.find(r => r.teamId === userTeam.id);
            if (!ownTeamRanking) continue;

            const otherRankings = allRankings.filter(r => r.teamId === userTeam.id && r.userId !== userId);
            if (otherRankings.length === 0) continue;

            const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
            const optimism = averageOtherRanking - ownTeamRanking.rank; // Positive means they ranked higher (better)

            if (optimism > maxOptimism) {
                maxOptimism = optimism;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(optimism * 100) / 100,
                    description: `Ranks own team ${Math.round(ownTeamRanking.rank * 100) / 100} while others rank it ${Math.round(averageOtherRanking * 100) / 100}`
                };
            }
        }

        return winner;
    }

    private static async getRealityCheck(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        // This would need actual team performance data to calculate accurately
        // For now, return null as it requires additional data
        return null;
    }

    // Volatility & Movement Trophies
    private static async getBiggestDrop(allRankings: PowerRankingEntity[], currentWeek: number): Promise<TrophyWinner | null> {
        if (currentWeek <= 1) return null;

        const teamRepository = getRepository(TeamEntity);
        const teams = await teamRepository.find();
        let maxDrop = -1;
        let winner: TrophyWinner | null = null;

        for (const team of teams) {
            const currentWeekRankings = allRankings.filter(r => r.teamId === team.id);
            const lastWeekRankings = await this.getAllRankingsForTeam(team.id, currentWeek - 1);

            if (currentWeekRankings.length === 0 || lastWeekRankings.length === 0) continue;

            const currentAvg = currentWeekRankings.reduce((sum, r) => sum + r.rank, 0) / currentWeekRankings.length;
            const lastAvg = lastWeekRankings.reduce((sum, r) => sum + r.rank, 0) / lastWeekRankings.length;
            const drop = lastAvg - currentAvg; // Positive means they dropped (worse rank = higher number)

            if (drop > maxDrop) {
                maxDrop = drop;
                winner = {
                    userId: 'team',
                    username: team.ownerName,
                    teamName: team.teamName,
                    value: Math.round(drop * 100) / 100,
                    description: `Dropped from ${Math.round(lastAvg * 100) / 100} to ${Math.round(currentAvg * 100) / 100}`
                };
            }
        }

        return winner;
    }

    private static async getBiggestRise(allRankings: PowerRankingEntity[], currentWeek: number): Promise<TrophyWinner | null> {
        if (currentWeek <= 1) return null;

        const teamRepository = getRepository(TeamEntity);
        const teams = await teamRepository.find();
        let maxRise = -1;
        let winner: TrophyWinner | null = null;

        for (const team of teams) {
            const currentWeekRankings = allRankings.filter(r => r.teamId === team.id);
            const lastWeekRankings = await this.getAllRankingsForTeam(team.id, currentWeek - 1);

            if (currentWeekRankings.length === 0 || lastWeekRankings.length === 0) continue;

            const currentAvg = currentWeekRankings.reduce((sum, r) => sum + r.rank, 0) / currentWeekRankings.length;
            const lastAvg = lastWeekRankings.reduce((sum, r) => sum + r.rank, 0) / lastWeekRankings.length;
            const rise = currentAvg - lastAvg; // Positive means they rose (better rank = lower number)

            if (rise > maxRise) {
                maxRise = rise;
                winner = {
                    userId: 'team',
                    username: team.ownerName,
                    teamName: team.teamName,
                    value: Math.round(rise * 100) / 100,
                    description: `Rose from ${Math.round(lastAvg * 100) / 100} to ${Math.round(currentAvg * 100) / 100}`
                };
            }
        }

        return winner;
    }

    private static async getYoYoMaster(allRankings: PowerRankingEntity[], currentWeek: number): Promise<TrophyWinner | null> {
        const teamRepository = getRepository(TeamEntity);
        const teams = await teamRepository.find();
        let maxVolatility = -1;
        let winner: TrophyWinner | null = null;

        for (const team of teams) {
            const allTeamRankings = [];
            for (let week = 1; week <= currentWeek; week++) {
                const weekRankings = await this.getAllRankingsForTeam(team.id, week);
                if (weekRankings.length > 0) {
                    const avgRank = weekRankings.reduce((sum, r) => sum + r.rank, 0) / weekRankings.length;
                    allTeamRankings.push(avgRank);
                }
            }

            if (allTeamRankings.length < 2) continue;

            const volatility = this.calculateStandardDeviation(allTeamRankings);
            if (volatility > maxVolatility) {
                maxVolatility = volatility;
                winner = {
                    userId: 'team',
                    username: team.ownerName,
                    teamName: team.teamName,
                    value: Math.round(volatility * 100) / 100,
                    description: `Standard deviation of ${Math.round(volatility * 100) / 100} across ${allTeamRankings.length} weeks`
                };
            }
        }

        return winner;
    }

    private static async getSteadyEddie(allRankings: PowerRankingEntity[], currentWeek: number): Promise<TrophyWinner | null> {
        const teamRepository = getRepository(TeamEntity);
        const teams = await teamRepository.find();
        let minVolatility = Infinity;
        let winner: TrophyWinner | null = null;

        for (const team of teams) {
            const allTeamRankings = [];
            for (let week = 1; week <= currentWeek; week++) {
                const weekRankings = await this.getAllRankingsForTeam(team.id, week);
                if (weekRankings.length > 0) {
                    const avgRank = weekRankings.reduce((sum, r) => sum + r.rank, 0) / weekRankings.length;
                    allTeamRankings.push(avgRank);
                }
            }

            if (allTeamRankings.length < 2) continue;

            const volatility = this.calculateStandardDeviation(allTeamRankings);
            if (volatility < minVolatility) {
                minVolatility = volatility;
                winner = {
                    userId: 'team',
                    username: team.ownerName,
                    teamName: team.teamName,
                    value: Math.round(volatility * 100) / 100,
                    description: `Standard deviation of ${Math.round(volatility * 100) / 100} across ${allTeamRankings.length} weeks`
                };
            }
        }

        return winner;
    }

    // Ranking Behavior Trophies
    private static async getContrarian(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxContrarian = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            let contrarianScore = 0;
            const user = rankings[0].user;

            for (const ranking of rankings) {
                const otherRankings = allRankings.filter(r => r.teamId === ranking.teamId && r.userId !== userId);
                if (otherRankings.length === 0) continue;

                const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
                const difference = Math.abs(ranking.rank - averageOtherRanking);
                contrarianScore += difference;
            }

            if (contrarianScore > maxContrarian) {
                maxContrarian = contrarianScore;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(contrarianScore * 100) / 100,
                    description: `Average difference of ${Math.round((contrarianScore / rankings.length) * 100) / 100} from consensus`
                };
            }
        }

        return winner;
    }

    private static async getConsensusBuilder(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let minContrarian = Infinity;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            let consensusScore = 0;
            const user = rankings[0].user;

            for (const ranking of rankings) {
                const otherRankings = allRankings.filter(r => r.teamId === ranking.teamId && r.userId !== userId);
                if (otherRankings.length === 0) continue;

                const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
                const difference = Math.abs(ranking.rank - averageOtherRanking);
                consensusScore += difference;
            }

            if (consensusScore < minContrarian) {
                minContrarian = consensusScore;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(consensusScore * 100) / 100,
                    description: `Average difference of ${Math.round((consensusScore / rankings.length) * 100) / 100} from consensus`
                };
            }
        }

        return winner;
    }

    private static async getExtremeRanker(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxVariance = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const ranks = rankings.map(r => r.rank);
            const variance = this.calculateVariance(ranks);
            const user = rankings[0].user;

            if (variance > maxVariance) {
                maxVariance = variance;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(variance * 100) / 100,
                    description: `Variance of ${Math.round(variance * 100) / 100} in rankings`
                };
            }
        }

        return winner;
    }

    private static async getSafeRanker(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let minVariance = Infinity;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const ranks = rankings.map(r => r.rank);
            const variance = this.calculateVariance(ranks);
            const user = rankings[0].user;

            if (variance < minVariance) {
                minVariance = variance;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(variance * 100) / 100,
                    description: `Variance of ${Math.round(variance * 100) / 100} in rankings`
                };
            }
        }

        return winner;
    }

    private static async getHomer(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxHomer = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            let homerScore = 0;
            let teamCount = 0;

            for (const ranking of rankings) {
                const otherRankings = allRankings.filter(r => r.teamId === ranking.teamId && r.userId !== userId);
                if (otherRankings.length === 0) continue;

                const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
                const bias = averageOtherRanking - ranking.rank; // Positive means they ranked higher
                homerScore += bias;
                teamCount++;
            }

            if (teamCount > 0) {
                const avgHomerScore = homerScore / teamCount;
                if (avgHomerScore > maxHomer) {
                    maxHomer = avgHomerScore;
                    winner = {
                        userId,
                        username: user.username,
                        teamName: await this.getUserTeamName(userId),
                        value: Math.round(avgHomerScore * 100) / 100,
                        description: `Average bias of ${Math.round(avgHomerScore * 100) / 100} toward teams`
                    };
                }
            }
        }

        return winner;
    }

    private static async getHater(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxHater = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            let haterScore = 0;
            let teamCount = 0;

            for (const ranking of rankings) {
                const otherRankings = allRankings.filter(r => r.teamId === ranking.teamId && r.userId !== userId);
                if (otherRankings.length === 0) continue;

                const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
                const bias = ranking.rank - averageOtherRanking; // Positive means they ranked lower
                haterScore += bias;
                teamCount++;
            }

            if (teamCount > 0) {
                const avgHaterScore = haterScore / teamCount;
                if (avgHaterScore > maxHater) {
                    maxHater = avgHaterScore;
                    winner = {
                        userId,
                        username: user.username,
                        teamName: await this.getUserTeamName(userId),
                        value: Math.round(avgHaterScore * 100) / 100,
                        description: `Average bias of ${Math.round(avgHaterScore * 100) / 100} against teams`
                    };
                }
            }
        }

        return winner;
    }

    // Statistical Anomaly Trophies
    private static async getOutlierKing(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const userRankings = this.groupRankingsByUser(allRankings);
        let maxOutlier = -1;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            let outlierScore = 0;

            for (const ranking of rankings) {
                const otherRankings = allRankings.filter(r => r.teamId === ranking.teamId && r.userId !== userId);
                if (otherRankings.length === 0) continue;

                const averageOtherRanking = otherRankings.reduce((sum, r) => sum + r.rank, 0) / otherRankings.length;
                const difference = Math.abs(ranking.rank - averageOtherRanking);
                outlierScore += difference;
            }

            if (outlierScore > maxOutlier) {
                maxOutlier = outlierScore;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(outlierScore * 100) / 100,
                    description: `Total difference of ${Math.round(outlierScore * 100) / 100} from averages`
                };
            }
        }

        return winner;
    }

    private static async getPredictable(allRankings: PowerRankingEntity[], currentWeek: number): Promise<TrophyWinner | null> {
        if (currentWeek <= 1) return null;

        const userRankings = this.groupRankingsByUser(allRankings);
        let minPredictability = Infinity;
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            let predictabilityScore = 0;
            let weekCount = 0;

            // Compare with previous week's rankings
            const lastWeekRankings = await this.getAllRankingsForUser(userId, currentWeek - 1);
            if (lastWeekRankings.length === 0) continue;

            for (const currentRanking of rankings) {
                const lastRanking = lastWeekRankings.find(r => r.teamId === currentRanking.teamId);
                if (lastRanking) {
                    const change = Math.abs(currentRanking.rank - lastRanking.rank);
                    predictabilityScore += change;
                    weekCount++;
                }
            }

            if (weekCount > 0) {
                const avgChange = predictabilityScore / weekCount;
                if (avgChange < minPredictability) {
                    minPredictability = avgChange;
                    winner = {
                        userId,
                        username: user.username,
                        teamName: await this.getUserTeamName(userId),
                        value: Math.round(avgChange * 100) / 100,
                        description: `Average change of ${Math.round(avgChange * 100) / 100} from last week`
                    };
                }
            }
        }

        return winner;
    }

    // Helper methods
    private static groupRankingsByUser(allRankings: PowerRankingEntity[]): Map<string, PowerRankingEntity[]> {
        const userRankings = new Map<string, PowerRankingEntity[]>();
        
        for (const ranking of allRankings) {
            if (!userRankings.has(ranking.userId)) {
                userRankings.set(ranking.userId, []);
            }
            userRankings.get(ranking.userId)!.push(ranking);
        }

        return userRankings;
    }

    private static async getUserTeam(userId: string): Promise<TeamEntity | null> {
        const userRepository = getRepository(UserEntity);
        const sleeperUserRepository = getRepository(SleeperUserEntity);
        const teamRepository = getRepository(TeamEntity);
        
        // Get the user's username
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) return null;
        
        // Find the corresponding SleeperUserEntity
        const sleeperUser = await sleeperUserRepository.findOne({ where: { username: user.username } });
        if (!sleeperUser) return null;
        
        // Find the team with matching sleeperUsername
        const team = await teamRepository.findOne({ where: { sleeperUsername: sleeperUser.username } });
        return team;
    }

    private static async getUserTeamName(userId: string): Promise<string> {
        const team = await this.getUserTeam(userId);
        return team ? team.teamName : 'Unknown Team';
    }

    private static calculateStandardDeviation(values: number[]): number {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    private static calculateVariance(values: number[]): number {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}
