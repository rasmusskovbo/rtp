import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { SleeperRosterEntity } from "./SleeperRosterEntity";

@Entity()
export class PlayerEntity {
    @PrimaryColumn()
    player_id!: string;

    @Column({ nullable: true })
    status!: string;

    @Column({ nullable: true })
    sport!: string;

    @Column({ nullable: true })
    number!: number;
    
    @Column({ nullable: true })
    position!: string;

    @Column({ nullable: true })
    team!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column({ nullable: true })
    college!: string;

    @Column({ nullable: true })
    injury_status!: string;

    @Column({ nullable: true })
    age!: number;

    @Column({ nullable: true })
    first_name!: string;

    @Column({ nullable: true })
    years_exp!: number;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.starters)
    starters!: SleeperRosterEntity;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.players)
    players!: SleeperRosterEntity;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.reserve)
    reserve!: SleeperRosterEntity;



}
