import { PostsEntity } from '../database/entities/PostEntity';
import { getRepository } from 'typeorm';

export class PostMapper {
    static async toDTO(amount?: number) {
        const postRepository = getRepository(PostsEntity);
        const takeAmount = amount !== undefined ? amount : 500;

        const posts = await postRepository.find({
            order: {
                createdAt: 'DESC'
            },
            take: takeAmount
        });

        return posts.map((post) => ({
            id: post.id,
            author: post.author,
            title: post.title,
            type: post.type,
            content: post.content,
            contentLink: post.contentLink,
            createdAt: post.createdAt,
        }));
    }
}
