import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {SleeperService} from "../services/SleeperService";
import {ISleeperUser} from "../database/entities/ISleeperUser";

export class StatsMapper {
    constructor(private sleeperService: SleeperService) {}

    async mapAvatarAndRtpScore(allTimeWinnersStats: AllTimeWinnersEntity[]): Promise<AllTimeWinnersEntity[]> {
        return Promise.all(allTimeWinnersStats.map(async (item) => {
            const rtpScore = this.calculateRtpScore(item);
            const avatar = await this.mapAvatar(item)
            return { ...item, rtpScore, avatar };
        }));
    }

    async mapAvatarOnly(stats: (AllTimeStandingsEntity[] | WeeklyHighScoreEntity[] | PlayerHighScoreEntity[])) {
        return Promise.all(stats.map(async (item) => {
            const avatar = await this.mapAvatar(item)
            return { ...item, avatar };
        }));
    }

    private async mapAvatar(stats: ISleeperUser) {
        const sleeperUser = await this.sleeperService.getSleeperUserBySleeperUsername(stats.sleeper_username)
        return sleeperUser.avatar;
    }

    private calculateRtpScore(statLine: AllTimeWinnersEntity): number {
        const positiveRtpScore =
            statLine.wins * 40 +
            statLine.second_place * 20 +
            statLine.third_place * 10 +
            statLine.playoff_appearances * 5;

        const negativeRtpScore =
            statLine.pinks * 40 +
            statLine.toilet_wins * 20

        return positiveRtpScore - negativeRtpScore;
    }

}

