import express, { NextFunction, Request, Response, Router } from 'express';
import upload from '../aws/S3Client';
import { ContentType, PostsEntity } from "../database/entities/PostEntity";
import { getRepository } from "typeorm";

const uploadRouter: Router = express.Router();

uploadRouter.post(
    '/upload',
    upload.single('file'), // This should run first for file uploads
    (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body);
        next();
    },
    async (req: Request, res: Response) => {
        console.log("Received upload request");
        const file = req.file as any; // bypass TypeScript compiler checks
        const { title, author, type, content, url } = req.body;

        const postsRepository = getRepository(PostsEntity);
        const newPost = new PostsEntity();

        newPost.title = title;
        newPost.author = author;
        newPost.type = type as ContentType;

        if (newPost.type === ContentType.TEXT || newPost.type === ContentType.PDF) {
            newPost.content = content;
        }

        if (newPost.type === ContentType.VIDEO || newPost.type === ContentType.AUDIO) {
            if (url && url.startsWith('https://drive.google.com/file/d/')) {
                const fileIdMatch = url.match(/\/d\/(.*?)\//);
                if (fileIdMatch && fileIdMatch[1]) {
                    const fileId = fileIdMatch[1];
                    const proxyUrl = `${process.env.API_HOST}/api/proxy?id=${fileId}`;
                    newPost.contentLink = proxyUrl;
                } else {
                    return res.status(400).json({ error: 'Invalid Google Drive URL provided.' });
                }
            } else {
                return res.status(400).json({ error: 'Invalid URL provided for video or audio content.' });
            }
        } else if (file) {
            newPost.contentLink = file.location;
        }

        try {
            await postsRepository.save(newPost);

            return res.status(201).json({
                message: 'Post created successfully',
                post: newPost
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'An error occurred while saving the post.' });
        }
    }
);

export default uploadRouter;
