import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    Unique,
    Index
} from "typeorm";
import { PowerRankingEntity } from "./PowerRankingEntity";
import { UserEntity } from "./UserEntity";

@Entity('comment_likes')
@Unique(['comment', 'user']) // Ensure one like per user per comment
@Index(['comment', 'user']) // Index for faster lookups
export class CommentLikeEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => PowerRankingEntity, { eager: false })
    comment!: PowerRankingEntity;

    @ManyToOne(() => UserEntity, { eager: false })
    user!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;
}