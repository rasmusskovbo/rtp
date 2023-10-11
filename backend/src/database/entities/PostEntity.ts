import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BeforeInsert,
} from 'typeorm';

export enum ContentType {
    TEXT = "text",
    VIDEO = "video",
    PDF = "pdf",
    AUDIO = "audio"
}

@Entity()
export class PostsEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', nullable: false })
    author!: string;

    @Column({ type: 'varchar', nullable: false })
    title!: string;

    @Column({
        type: "enum",
        enum: ContentType,
        nullable: false
    })
    type!: ContentType;

    @Column({ type: 'text', nullable: true })
    content!: string;

    @Column({ type: 'varchar', nullable: true })
    contentLink!: string;

    @Column({ type: 'int', default: 0})
    upvotes!: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @BeforeInsert()
    async checkContent() {
        if (this.type == ContentType.TEXT && !this.content) {
            throw new Error("Content cannot be null for type 'text'");
        }
        if (!this.upvotes) {
            this.upvotes = 0;
        }
    }
}
