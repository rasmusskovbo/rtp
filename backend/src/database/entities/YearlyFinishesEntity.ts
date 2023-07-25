import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity("yearly_finishes")
export class YearlyFinishesEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100})
    year!: string;

    @Column({type: "varchar", length: 100})
    winner!: string;

    @Column({type: "varchar", length: 100})
    second!: string;

    @Column({type: "varchar", length: 100})
    third!: string;

    @Column({type: "varchar", length: 100})
    last_regular!: string;

    @Column({type: "varchar", length: 100})
    last_playoffs!: string;

    @Column({type: "int"})
    league_size!: number;
}
