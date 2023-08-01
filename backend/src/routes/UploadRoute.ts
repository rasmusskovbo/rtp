import express, {NextFunction, Request, Response, Router} from 'express';
import upload from '../aws/S3Client'
import {ContentType, PostsEntity} from "../database/entities/PostEntity";
import {getRepository} from "typeorm";

const uploadRouter: Router = express.Router();

uploadRouter.post(
    '/upload',
    upload.single('file'), // This should run first
    (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body);
        next();
    },
    async (req: Request, res: Response) => {
        console.log("Received upload request");
        const file = req.file as any; // bypass TypeScript compiler checks
        const { title, author, type, content } = req.body;

        const postsRepository = getRepository(PostsEntity);
        const newPost = new PostsEntity();

        newPost.title = title;
        newPost.author = author;
        newPost.type = type as ContentType;

        if (newPost.type === ContentType.TEXT || newPost.type == ContentType.PDF)  {
            newPost.content = content;
        }
        if (file) {
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
