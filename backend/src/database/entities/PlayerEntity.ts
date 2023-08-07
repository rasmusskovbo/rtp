import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { SleeperRosterEntity } from "./SleeperRosterEntity";

@Entity()
export class PlayerEntity {
    @PrimaryColumn()
    player_id!: string;
    
    @Column({ nullable: true })
    depth_chart_position!: number;

    @Column({ nullable: true })
    status!: string;

    @Column({ nullable: true })
    sport!: string;

    @Column({ nullable: true })
    number!: number;
    
    @Column({ nullable: true })
    position!: string;

    @Column({ nullable: true })
    sportradar_id!: string;

    @Column({ nullable: true })
    team!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column({ nullable: true })
    college!: string;

    @Column({ nullable: true })
    fantasy_data_id!: number;

    @Column({ nullable: true })
    injury_status!: string;

    @Column({ nullable: true })
    height!: string;

    @Column({ nullable: true })
    search_full_name!: string;

    @Column({ nullable: true })
    age!: number;

    @Column({ nullable: true })
    stats_id!: string;

    @Column({ nullable: true })
    birth_country!: string;

    @Column({ nullable: true })
    espn_id!: string;

    @Column({ nullable: true })
    search_rank!: number;

    @Column({ nullable: true })
    first_name!: string;

    @Column({ nullable: true })
    depth_chart_order!: number;

    @Column({ nullable: true })
    years_exp!: number;

    @Column({ nullable: true })
    rotowire_id!: number;

    @Column({ nullable: true })
    rotoworld_id!: number;

    @Column({ nullable: true })
    search_first_name!: string;

    @Column({ nullable: true })
    yahoo_id!: number;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.starters)
    starters!: SleeperRosterEntity;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.players)
    players!: SleeperRosterEntity;

    @ManyToOne(() => SleeperRosterEntity, (roster) => roster.reserve)
    reserve!: SleeperRosterEntity;



}
