import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";

@Entity()
export class TeamEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sleeperUsername!: string;

    @Column()
    teamName!: string;

    @Column()
    ownerName!: string;

    @Column({nullable: true})
    nationality!: string;

    @Column()
    teamMascot!: string;

    @Column()
    yearsInLeague!: number;

    @Column()
    bio!: string;

    @Column()
    teamLogo!: string;

    @Column()
    ownerImage!: string;
}
