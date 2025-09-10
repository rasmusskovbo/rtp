import { UserEntity } from '../database/entities/UserEntity'
import { getRepository } from 'typeorm';

export class AuthService {
    async validateUser(username: string, password: string): Promise<UserEntity | null> {
        const userRepository = getRepository(UserEntity);
        const user = await userRepository
            .createQueryBuilder("user")
            .where("user.username ILIKE :username", { username })
            .getOne();

        if (user && await user.validatePassword(password)) {
            return user;
        } else {
            return null;
        }
    }

    async getUserByUsername(username: string): Promise<UserEntity | null> {
        const userRepository = getRepository(UserEntity);
        return await userRepository
            .createQueryBuilder("user")
            .where("user.username ILIKE :username", { username })
            .getOne();
    }
}
