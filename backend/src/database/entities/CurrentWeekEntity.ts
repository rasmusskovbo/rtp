import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class CurrentWeekEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    weekNumber!: number;

    @Column({ type: "boolean", default: "false"})
    voteLockedOut!: boolean

}
