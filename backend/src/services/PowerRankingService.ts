import { getRepository } from 'typeorm';
import { PowerRankingEntity } from '../database/entities/PowerRankingEntity';
import { TeamEntity } from '../database/entities/TeamEntity';
import { UserEntity } from '../database/entities/UserEntity';
import { CurrentWeekEntity } from '../database/entities/CurrentWeekEntity';

export interface TeamRankingData {
    team: TeamEntity;
    currentRank: number;
    lastWeekRank?: number;
    rankDifference?: number;
    averageRank: number;
    totalRankings: number;
}

export interface WeeklyRankingData {
    week: number;
    teamRankings: TeamRankingData[];
}

export interface UserRankingSubmission {
    teamId: number;
    rank: number;
    comment?: string;
}

export class PowerRankingService {
    /**
     * Look up the current week number from the database.
     */
    public static async getCurrentWeekNumber(): Promise<number> {
        const weekRepository = getRepository(CurrentWeekEntity);
        const currentWeekEntity = await weekRepository.find();
        if (!currentWeekEntity || currentWeekEntity.length === 0) {
            throw new Error('No current week found in database');
        }
        return currentWeekEntity[0].weekNumber;
    }

    /**
     * Get current power rankings (latest week) with calculated averages
     */
    static async getCurrentRankings(): Promise<TeamRankingData[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const teamRepository = getRepository(TeamEntity);

        // Get all teams
        const teams = await teamRepository.find();

        // Get the current week number from DB
        const currentWeek = await this.getCurrentWeekNumber();

        const teamRankings: TeamRankingData[] = [];

        for (const team of teams) {
            // Get current week rankings for this team
            const currentWeekRankings = await rankingRepository
                .createQueryBuilder('ranking')
                .where('ranking.teamId = :teamId', { teamId: team.id })
                .andWhere('ranking.week = :week', { week: currentWeek })
                .getMany();

            // Get last week rankings for this team
            const lastWeekRankings = currentWeek > 1 ? await rankingRepository
                .createQueryBuilder('ranking')
                .where('ranking.teamId = :teamId', { teamId: team.id })
                .andWhere('ranking.week = :week', { week: currentWeek - 1 })
                .getMany() : [];

            // Get all rankings for this team to calculate average
            const allRankings = await rankingRepository
                .createQueryBuilder('ranking')
                .where('ranking.teamId = :teamId', { teamId: team.id })
                .getMany();

            // Calculate current rank (average of current week rankings)
            const currentRank = currentWeekRankings.length > 0 
                ? currentWeekRankings.reduce((sum, r) => sum + r.rank, 0) / currentWeekRankings.length
                : 0;

            // Calculate last week rank (average of last week rankings)
            const lastWeekRank = lastWeekRankings.length > 0 
                ? lastWeekRankings.reduce((sum, r) => sum + r.rank, 0) / lastWeekRankings.length
                : undefined;

            // Calculate average rank through season
            const averageRank = allRankings.length > 0 
                ? allRankings.reduce((sum, r) => sum + r.rank, 0) / allRankings.length
                : 0;

            // Calculate rank difference
            const rankDifference = lastWeekRank !== undefined ? currentRank - lastWeekRank : undefined;

            teamRankings.push({
                team,
                currentRank: Math.round(currentRank * 100) / 100, // Round to 2 decimal places
                lastWeekRank: lastWeekRank ? Math.round(lastWeekRank * 100) / 100 : undefined,
                rankDifference: rankDifference ? Math.round(rankDifference * 100) / 100 : undefined,
                averageRank: Math.round(averageRank * 100) / 100,
                totalRankings: allRankings.length
            });
        }

        // Sort by current rank (ascending - lower rank number is better)
        return teamRankings.sort((a, b) => a.currentRank - b.currentRank);
    }

    /**
     * Get rankings for a specific week
     */
    static async getRankingsForWeek(week: number): Promise<TeamRankingData[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const teamRepository = getRepository(TeamEntity);

        const teams = await teamRepository.find();
        const teamRankings: TeamRankingData[] = [];

        for (const team of teams) {
            const weekRankings = await rankingRepository
                .createQueryBuilder('ranking')
                .where('ranking.teamId = :teamId', { teamId: team.id })
                .andWhere('ranking.week = :week', { week })
                .getMany();

            const allRankings = await rankingRepository
                .createQueryBuilder('ranking')
                .where('ranking.teamId = :teamId', { teamId: team.id })
                .getMany();

            const currentRank = weekRankings.length > 0 
                ? weekRankings.reduce((sum, r) => sum + r.rank, 0) / weekRankings.length
                : 0;

            const averageRank = allRankings.length > 0 
                ? allRankings.reduce((sum, r) => sum + r.rank, 0) / allRankings.length
                : 0;

            teamRankings.push({
                team,
                currentRank: Math.round(currentRank * 100) / 100,
                averageRank: Math.round(averageRank * 100) / 100,
                totalRankings: allRankings.length
            });
        }

        return teamRankings.sort((a, b) => a.currentRank - b.currentRank);
    }

    /**
     * Get rankings for the current week (fetched from DB)
     */
    static async getRankingsForCurrentWeek(): Promise<TeamRankingData[]> {
        const week = await this.getCurrentWeekNumber();
        return this.getRankingsForWeek(week);
    }

    /**
     * Submit rankings for a user for a specific week
     */
    static async submitRankings(
        userId: string,
        rankings: UserRankingSubmission[]
    ): Promise<void> {
        const rankingRepository = getRepository(PowerRankingEntity);
        const week = await this.getCurrentWeekNumber();

        // Validate that all ranks are between 1-12 and unique
        const ranks = rankings.map(r => r.rank);
        if (ranks.some(rank => rank < 1 || rank > 12)) {
            throw new Error('All ranks must be between 1 and 12');
        }
        
        const uniqueRanks = new Set(ranks);
        if (uniqueRanks.size !== ranks.length) {
            throw new Error('All ranks must be unique');
        }

        // Validate that we have exactly 12 rankings (one for each team)
        if (rankings.length !== 12) {
            throw new Error('Must provide exactly 12 rankings (one for each team)');
        }

        // Enforce one submission per user per week
        const existingCount = await rankingRepository
            .createQueryBuilder('ranking')
            .where('ranking.userId = :userId', { userId })
            .andWhere('ranking.week = :week', { week })
            .getCount();

        if (existingCount > 0) {
            throw new Error('You have already submitted rankings for this week');
        }

        // Insert new rankings
        const rankingEntities = rankings.map(ranking => {
            const entity = new PowerRankingEntity();
            entity.userId = userId;
            entity.week = week;
            entity.teamId = ranking.teamId;
            entity.rank = ranking.rank;
            entity.comment = ranking.comment;
            return entity;
        });

        await rankingRepository.save(rankingEntities);
    }

    /**
     * Get all available weeks that have rankings
     */
    static async getAvailableWeeks(): Promise<number[]> {
        const rankingRepository = getRepository(PowerRankingEntity);
        
        const weeks = await rankingRepository
            .createQueryBuilder('ranking')
            .select('DISTINCT ranking.week', 'week')
            .orderBy('ranking.week', 'ASC')
            .getRawMany();

        return weeks.map(w => w.week);
    }

    /**
     * Get rankings submitted by a specific user for a specific week
     */
    static async getUserRankingsForWeek(userId: string, week: number): Promise<PowerRankingEntity[]> {
        const rankingRepository = getRepository(PowerRankingEntity);

        return await rankingRepository
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.team', 'team')
            .where('ranking.userId = :userId', { userId })
            .andWhere('ranking.week = :week', { week })
            .orderBy('ranking.rank', 'ASC')
            .getMany();
    }

    /**
     * Get rankings submitted by a specific user for the current week
     */
    static async getUserRankingsForCurrentWeek(userId: string): Promise<PowerRankingEntity[]> {
        const week = await this.getCurrentWeekNumber();
        return this.getUserRankingsForWeek(userId, week);
    }
}