import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { TeamEntity } from "./TeamEntity";
import { UserEntity } from "./UserEntity";

@Entity('power_rankings')
@Index(['week', 'team', 'user'], { unique: true }) // Ensure one ranking per user per team per week
export class PowerRankingEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    week!: number;

    @Column()
    rank!: number; // 1-12

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @Column()
    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt!: Date;

    @Column()
    teamId!: number;

    @Column()
    userId!: string;

    @ManyToOne(() => TeamEntity, { eager: true })
    team!: TeamEntity;

    @ManyToOne(() => UserEntity, { eager: true })
    user!: UserEntity;
}