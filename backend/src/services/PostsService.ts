import {ContentType, PostsEntity} from '../database/entities/PostEntity';
import { getRepository } from 'typeorm';

interface PostDTO {
    id: number;
    author: string;
    title: string;
    type: ContentType;
    content: string;
    contentLink: string;
    upvotes: number;
    createdAt: Date;
}

export class PostsService {
    static async fetchAndMap(amount?: number) {
        const postRepository = getRepository(PostsEntity);
        const takeAmount = amount !== undefined ? amount : 500;

        const posts = await postRepository.find({
            order: {
                createdAt: 'DESC'
            },
            take: takeAmount
        });

        return posts.map(this.mapPostToDTO);
    }

    static mapPostToDTO(post: PostsEntity): PostDTO {
        return {
            id: post.id,
            author: post.author,
            title: post.title,
            type: post.type,
            content: post.content,
            contentLink: post.contentLink,
            upvotes: post.upvotes,
            createdAt: post.createdAt
        }
    }

    static async addUpvote(id: number) {
        const postRepository = getRepository(PostsEntity);

        let post = await postRepository.findOne({ where: { id: id } });
        if (post) {
            post.upvotes++;
            post = await postRepository.save(post);
        }

        return post ? this.mapPostToDTO(post) : null;
    }
}
