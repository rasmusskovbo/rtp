import express, { Request, Response } from 'express';
import { PostsService } from '../mappers/PostsService';

const router = express.Router();

router.get('/posts', async (req: Request, res: Response) => {
    const numberToTake = req.query.amount ? parseInt(req.query.amount as string) : undefined;
    const postsDTO = await PostsService.fetchAndMap(numberToTake);
    res.json(postsDTO);
});

router.post('/posts/upvote/:postId', async (req: Request, res: Response) => {
    const postId = req.params.postId;

    const updatedUpvotes = await PostsService.addUpvote(parseInt(postId));

    res.json({ upvotes: updatedUpvotes });
});

export default router;
