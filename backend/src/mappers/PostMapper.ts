import { PostsEntity } from '../database/entities/PostEntity';
import { getRepository } from 'typeorm';

export class PostMapper {
    static async toDTO() {
        const postRepository = getRepository(PostsEntity);
        const posts = await postRepository.find({
            order: {
                createdAt: 'DESC'
            },
            take: 10
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
