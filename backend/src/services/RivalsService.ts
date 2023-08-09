import { Repository, getRepository } from "typeorm";
import { RivalEntity } from "../database/entities/RivalEntity"; // Replace with the correct path to your RivalEntity file

export class RivalsService {
    private rivalRepository: Repository<RivalEntity>;

    constructor() {
        this.rivalRepository = getRepository(RivalEntity);
    }

    async findRivalByTeamId(teamId: number): Promise<RivalEntity | undefined> {
        const result = await this.rivalRepository.createQueryBuilder("rival")
            .innerJoinAndSelect("rival.owner", "owner")
            .innerJoinAndSelect("rival.rivalTeam", "rivalTeam")
            .where("owner.id = :teamId", {teamId})
            .getOne();

        return result ?? undefined;
    }
}
