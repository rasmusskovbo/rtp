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
    // Additional fields for Homer award
    biasedTeamId?: number;
    biasedTeamName?: string;
    rankingDifference?: number;
    averageUserRank?: number;
    averageOthersRank?: number;
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
                description: 'User who ranks their own team highest compared to how others rank it',
                icon: '🏠',
                category: 'Bias & Self-Rating',
                winner: await this.getBiggestHomie(allRankings)
            },
            {
                id: 'biggest-self-hater',
                title: 'Biggest Self-Hater',
                description: 'User who ranks their own team lowest compared to how others rank it (across all weeks)',
                icon: '💔',
                category: 'Bias & Self-Rating',
                winner: await this.getBiggestSelfHater()
            },
            {
                id: 'realist',
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
                description: 'User who consistently ranks a specific other team higher than all other users',
                icon: '🏈',
                category: 'Ranking Behavior',
                winner: await this.getHomer(allRankings)
            },
            {
                id: 'hater',
                title: 'Hater',
                description: 'User who consistently ranks a specific other team lower than all other users',
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
        const rankingRepository = getRepository(PowerRankingEntity);
        const allRankingsAcrossWeeks: PowerRankingEntity[] = await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .getMany();

        if (allRankingsAcrossWeeks.length === 0) return null;

        const userRankings = this.groupRankingsByUser(allRankingsAcrossWeeks);
        let bestRelativeRanking = Infinity; // Lower is better (rank 1 is best)
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            // All rankings for the user's team across all users/weeks
            const teamRankingsAllUsers = allRankingsAcrossWeeks.filter(r => r.teamId === userTeam.id);
            if (teamRankingsAllUsers.length === 0) continue;

            // This user's rankings of their own team across weeks
            const ownTeamRankings = rankings.filter(r => r.teamId === userTeam.id);
            if (ownTeamRankings.length === 0) continue;

            // Prefer averaging over weeks where both own and others' rankings exist
            const weeks = new Set(teamRankingsAllUsers.map(r => r.week));
            let sumOwn = 0;
            let sumOthers = 0;
            let pairedWeeksCount = 0;

            for (const week of weeks) {
                const ownThisWeek = ownTeamRankings.find(r => r.week === week);
                if (!ownThisWeek) continue;
                const othersThisWeek = teamRankingsAllUsers.filter(r => r.week === week && r.userId !== userId);
                if (othersThisWeek.length === 0) continue;

                const othersAvgThisWeek = othersThisWeek.reduce((sum, r) => sum + r.rank, 0) / othersThisWeek.length;
                sumOwn += ownThisWeek.rank;
                sumOthers += othersAvgThisWeek;
                pairedWeeksCount++;
            }

            let ownAvg: number;
            let othersAvg: number;
            let description: string;

            if (pairedWeeksCount > 0) {
                ownAvg = sumOwn / pairedWeeksCount;
                othersAvg = sumOthers / pairedWeeksCount;
                description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across ${pairedWeeksCount} weeks`;
            } else {
                // Fallback to overall averages across all available weeks
                ownAvg = ownTeamRankings.reduce((sum, r) => sum + r.rank, 0) / ownTeamRankings.length;
                const othersAll = teamRankingsAllUsers.filter(r => r.userId !== userId);
                if (othersAll.length > 0) {
                    othersAvg = othersAll.reduce((sum, r) => sum + r.rank, 0) / othersAll.length;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across all weeks`;
                } else {
                    const teamOverallAvg = teamRankingsAllUsers.reduce((sum, r) => sum + r.rank, 0) / teamRankingsAllUsers.length;
                    othersAvg = teamOverallAvg;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs team overall avg ${Math.round(teamOverallAvg * 100) / 100}`;
                }
            }

            // Calculate how much better the user ranks their team compared to others
            // Lower own ranking (closer to 1) compared to others = bigger homie
            const relativeRanking = ownAvg - othersAvg; // Negative => ranks own team better than others
            
            // We want the user who ranks their team the BEST relative to others
            // This means the most negative relativeRanking (own rank much lower than others)
            if (relativeRanking < bestRelativeRanking) {
                bestRelativeRanking = relativeRanking;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(relativeRanking * 100) / 100,
                    description: description
                };
            }
        }

        return winner;
    }

    /**
     * Opposite of Biggest Homie, computed across all weeks:
     * Finds the user who, on average, ranks their own team the lowest compared to how others rank it.
     * Rank scale: 1 (best) to 12 (worst). We select the most negative (othersAvg - ownAvg).
     */
    private static async getBiggestSelfHater(): Promise<TrophyWinner | null> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const allRankings: PowerRankingEntity[] = await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .getMany();

        if (allRankings.length === 0) return null;

        const userRankings = this.groupRankingsByUser(allRankings);
        let minDifference = Infinity; // More negative is more self-hating
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            // All rankings for the user's team across all users/weeks
            const teamRankingsAllUsers = allRankings.filter(r => r.teamId === userTeam.id);
            if (teamRankingsAllUsers.length === 0) continue;

            // This user's rankings of their own team across weeks
            const ownTeamRankings = rankings.filter(r => r.teamId === userTeam.id);
            if (ownTeamRankings.length === 0) continue;

            // Prefer averaging over weeks where both own and others' rankings exist
            const weeks = new Set(teamRankingsAllUsers.map(r => r.week));
            let sumOwn = 0;
            let sumOthers = 0;
            let pairedWeeksCount = 0;

            for (const week of weeks) {
                const ownThisWeek = ownTeamRankings.find(r => r.week === week);
                if (!ownThisWeek) continue;
                const othersThisWeek = teamRankingsAllUsers.filter(r => r.week === week && r.userId !== userId);
                if (othersThisWeek.length === 0) continue;

                const othersAvgThisWeek = othersThisWeek.reduce((sum, r) => sum + r.rank, 0) / othersThisWeek.length;
                sumOwn += ownThisWeek.rank;
                sumOthers += othersAvgThisWeek;
                pairedWeeksCount++;
            }

            let ownAvg: number;
            let othersAvg: number;
            let description: string;

            if (pairedWeeksCount > 0) {
                ownAvg = sumOwn / pairedWeeksCount;
                othersAvg = sumOthers / pairedWeeksCount;
                description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across ${pairedWeeksCount} weeks`;
            } else {
                // Fallback to overall averages across all available weeks
                ownAvg = ownTeamRankings.reduce((sum, r) => sum + r.rank, 0) / ownTeamRankings.length;
                const othersAll = teamRankingsAllUsers.filter(r => r.userId !== userId);
                if (othersAll.length > 0) {
                    othersAvg = othersAll.reduce((sum, r) => sum + r.rank, 0) / othersAll.length;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across all weeks`;
                } else {
                    const teamOverallAvg = teamRankingsAllUsers.reduce((sum, r) => sum + r.rank, 0) / teamRankingsAllUsers.length;
                    othersAvg = teamOverallAvg;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs team overall avg ${Math.round(teamOverallAvg * 100) / 100}`;
                }
            }

            const difference = othersAvg - ownAvg; // Negative => ranks own team worse than others

            // Only consider negative differences for Self-Hater.
            if (difference < 0 && difference < minDifference) {
                minDifference = difference;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(difference * 100) / 100,
                    description
                };
            }
        }

        return winner;
    }

    private static async getHarshSelfCritic(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const allRankingsAcrossWeeks: PowerRankingEntity[] = await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .getMany();

        if (allRankingsAcrossWeeks.length === 0) return null;

        const userRankings = this.groupRankingsByUser(allRankingsAcrossWeeks);
        let minAbsoluteDifference = Infinity; // Smaller absolute difference = more realistic
        let winner: TrophyWinner | null = null;

        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;

            // All rankings for the user's team across all users/weeks
            const teamRankingsAllUsers = allRankingsAcrossWeeks.filter(r => r.teamId === userTeam.id);
            if (teamRankingsAllUsers.length === 0) continue;

            // This user's rankings of their own team across weeks
            const ownTeamRankings = rankings.filter(r => r.teamId === userTeam.id);
            if (ownTeamRankings.length === 0) continue;

            // Prefer averaging over weeks where both own and others' rankings exist
            const weeks = new Set(teamRankingsAllUsers.map(r => r.week));
            let sumOwn = 0;
            let sumOthers = 0;
            let pairedWeeksCount = 0;

            for (const week of weeks) {
                const ownThisWeek = ownTeamRankings.find(r => r.week === week);
                if (!ownThisWeek) continue;
                const othersThisWeek = teamRankingsAllUsers.filter(r => r.week === week && r.userId !== userId);
                if (othersThisWeek.length === 0) continue;

                const othersAvgThisWeek = othersThisWeek.reduce((sum, r) => sum + r.rank, 0) / othersThisWeek.length;
                sumOwn += ownThisWeek.rank;
                sumOthers += othersAvgThisWeek;
                pairedWeeksCount++;
            }

            let ownAvg: number;
            let othersAvg: number;
            let description: string;

            if (pairedWeeksCount > 0) {
                ownAvg = sumOwn / pairedWeeksCount;
                othersAvg = sumOthers / pairedWeeksCount;
                description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across ${pairedWeeksCount} weeks`;
            } else {
                // Fallback to overall averages across all available weeks
                ownAvg = ownTeamRankings.reduce((sum, r) => sum + r.rank, 0) / ownTeamRankings.length;
                const othersAll = teamRankingsAllUsers.filter(r => r.userId !== userId);
                if (othersAll.length > 0) {
                    othersAvg = othersAll.reduce((sum, r) => sum + r.rank, 0) / othersAll.length;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs others' ${Math.round(othersAvg * 100) / 100} across all weeks`;
                } else {
                    const teamOverallAvg = teamRankingsAllUsers.reduce((sum, r) => sum + r.rank, 0) / teamRankingsAllUsers.length;
                    othersAvg = teamOverallAvg;
                    description = `Own avg ${Math.round(ownAvg * 100) / 100} vs team overall avg ${Math.round(teamOverallAvg * 100) / 100}`;
                }
            }

            const absoluteDifference = Math.abs(othersAvg - ownAvg); // Absolute difference for realism

            // Find the smallest absolute difference (most realistic)
            if (absoluteDifference < minAbsoluteDifference) {
                minAbsoluteDifference = absoluteDifference;
                winner = {
                    userId,
                    username: user.username,
                    teamName: userTeam.teamName,
                    value: Math.round(absoluteDifference * 100) / 100,
                    description
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
            const drop = currentAvg - lastAvg; // Positive means they dropped (worse rank = higher number)

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
            const rise = lastAvg - currentAvg; // Positive means they rose (better rank = lower number)

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
                const averageDifference = contrarianScore / rankings.length;
                winner = {
                    userId,
                    username: user.username,
                    teamName: await this.getUserTeamName(userId),
                    value: Math.round(averageDifference * 100) / 100,
                    description: `Average difference of ${Math.round(averageDifference * 100) / 100} from consensus`
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
        const rankingRepository = getRepository(PowerRankingEntity);
        const allRankingsAcrossWeeks: PowerRankingEntity[] = await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .getMany();

        if (allRankingsAcrossWeeks.length === 0) return null;

        const userRankings = this.groupRankingsByUser(allRankingsAcrossWeeks);
        let maxHomerBias = -1;
        let winner: TrophyWinner | null = null;

        // Pre-calculate the average ranking for each team by all users
        const teamAverages = new Map<number, number>();
        const teamRankingsByTeam = new Map<number, PowerRankingEntity[]>();
        
        for (const ranking of allRankingsAcrossWeeks) {
            if (!teamRankingsByTeam.has(ranking.teamId)) {
                teamRankingsByTeam.set(ranking.teamId, []);
            }
            teamRankingsByTeam.get(ranking.teamId)!.push(ranking);
        }
        
        for (const [teamId, rankings] of teamRankingsByTeam) {
            const avgRank = rankings.reduce((sum, r) => sum + r.rank, 0) / rankings.length;
            teamAverages.set(teamId, avgRank);
        }

        // For each user, find the team they consistently rank higher than others
        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            
            // Get the user's own team to exclude it from calculations
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;
            
            // Group rankings by team for this user
            const teamRankings = new Map<number, PowerRankingEntity[]>();
            for (const ranking of rankings) {
                if (!teamRankings.has(ranking.teamId)) {
                    teamRankings.set(ranking.teamId, []);
                }
                teamRankings.get(ranking.teamId)!.push(ranking);
            }

            // For each team this user has ranked (excluding their own team), calculate their bias
            for (const [teamId, userTeamRankings] of teamRankings) {
                // Skip the user's own team
                if (teamId === userTeam.id) continue;
                
                // Get the overall average ranking for this team (all users)
                const othersAvgRank = teamAverages.get(teamId) || 0;
                
                if (othersAvgRank === 0) continue;

                // Calculate average ranking for this team by this user
                const userAvgRank = userTeamRankings.reduce((sum, r) => sum + r.rank, 0) / userTeamRankings.length;
                
                // Calculate bias (positive means user ranks team higher/better than others)
                const bias = othersAvgRank - userAvgRank;
                
                // Only consider positive bias (user ranks team higher than others)
                if (bias > maxHomerBias && bias > 0) {
                    maxHomerBias = bias;
                    const team = userTeamRankings[0].team;
                    
                    winner = {
                        userId,
                        username: user.username,
                        teamName: await this.getUserTeamName(userId),
                        value: Math.round(bias * 100) / 100,
                        description: `Ranks ${team.teamName} ${Math.round(userAvgRank * 100) / 100} on average while others rank it ${Math.round(othersAvgRank * 100) / 100}`,
                        biasedTeamId: teamId,
                        biasedTeamName: team.teamName,
                        rankingDifference: Math.round(bias * 100) / 100,
                        averageUserRank: Math.round(userAvgRank * 100) / 100,
                        averageOthersRank: Math.round(othersAvgRank * 100) / 100
                    };
                }
            }
        }

        return winner;
    }

    private static async getHater(allRankings: PowerRankingEntity[]): Promise<TrophyWinner | null> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const allRankingsAcrossWeeks: PowerRankingEntity[] = await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.user', 'user')
            .leftJoinAndSelect('ranking.team', 'team')
            .getMany();

        if (allRankingsAcrossWeeks.length === 0) return null;

        const userRankings = this.groupRankingsByUser(allRankingsAcrossWeeks);
        let maxHaterBias = -1;
        let winner: TrophyWinner | null = null;

        // Pre-calculate the average ranking for each team by all users
        const teamAverages = new Map<number, number>();
        const teamRankingsByTeam = new Map<number, PowerRankingEntity[]>();
        
        for (const ranking of allRankingsAcrossWeeks) {
            if (!teamRankingsByTeam.has(ranking.teamId)) {
                teamRankingsByTeam.set(ranking.teamId, []);
            }
            teamRankingsByTeam.get(ranking.teamId)!.push(ranking);
        }
        
        for (const [teamId, rankings] of teamRankingsByTeam) {
            const avgRank = rankings.reduce((sum, r) => sum + r.rank, 0) / rankings.length;
            teamAverages.set(teamId, avgRank);
        }

        // For each user, find the team they consistently rank lower than others
        for (const [userId, rankings] of userRankings) {
            const user = rankings[0].user;
            
            // Get the user's own team to exclude it from calculations
            const userTeam = await this.getUserTeam(userId);
            if (!userTeam) continue;
            
            // Group rankings by team for this user
            const teamRankings = new Map<number, PowerRankingEntity[]>();
            for (const ranking of rankings) {
                if (!teamRankings.has(ranking.teamId)) {
                    teamRankings.set(ranking.teamId, []);
                }
                teamRankings.get(ranking.teamId)!.push(ranking);
            }

            // For each team this user has ranked (excluding their own team), calculate their bias
            for (const [teamId, userTeamRankings] of teamRankings) {
                // Skip the user's own team
                if (teamId === userTeam.id) continue;
                
                // Get the overall average ranking for this team (all users)
                const othersAvgRank = teamAverages.get(teamId) || 0;
                
                if (othersAvgRank === 0) continue;

                // Calculate average ranking for this team by this user
                const userAvgRank = userTeamRankings.reduce((sum, r) => sum + r.rank, 0) / userTeamRankings.length;
                
                // Calculate bias (positive means user ranks team lower/worse than others)
                const bias = userAvgRank - othersAvgRank;
                
                // Only consider positive bias (user ranks team lower than others)
                if (bias > maxHaterBias && bias > 0) {
                    maxHaterBias = bias;
                    const team = userTeamRankings[0].team;
                    
                    winner = {
                        userId,
                        username: user.username,
                        teamName: await this.getUserTeamName(userId),
                        value: Math.round(bias * 100) / 100,
                        description: `Ranks ${team.teamName} ${Math.round(userAvgRank * 100) / 100} on average while others rank it ${Math.round(othersAvgRank * 100) / 100}`,
                        biasedTeamId: teamId,
                        biasedTeamName: team.teamName,
                        rankingDifference: Math.round(bias * 100) / 100,
                        averageUserRank: Math.round(userAvgRank * 100) / 100,
                        averageOthersRank: Math.round(othersAvgRank * 100) / 100
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

        // 1) Try direct match via Team.ownerName (case-insensitive)
        const teamByOwnerName = await teamRepository
            .createQueryBuilder('team')
            .where('LOWER(team.ownerName) = LOWER(:ownerName)', { ownerName: user.username })
            .getOne();
        if (teamByOwnerName) {
            return teamByOwnerName;
        }

        // 2) Try mapping User.username -> SleeperUser (case-insensitive on username OR display_name)
        const sleeperUser = await sleeperUserRepository
            .createQueryBuilder('sleeper')
            .where('LOWER(sleeper.username) = LOWER(:u)', { u: user.username })
            .orWhere('LOWER(sleeper.display_name) = LOWER(:u)', { u: user.username })
            .getOne();

        if (sleeperUser) {
            // 3) Find Team by Sleeper username (case-insensitive)
            const teamBySleeperUsername = await teamRepository
                .createQueryBuilder('team')
                .where('LOWER(team.sleeperUsername) = LOWER(:sn)', { sn: sleeperUser.username })
                .getOne();
            if (teamBySleeperUsername) {
                return teamBySleeperUsername;
            }
        }

        return null;
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
