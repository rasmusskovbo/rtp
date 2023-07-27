import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column('text')
    password!: string;

    async validatePassword(plainPassword: string): Promise<boolean> {
        // TODO requires user creation outside of DBA
        //return bcrypt.compare(plainPassword, this.password);
        return plainPassword == this.password;
    }
}
