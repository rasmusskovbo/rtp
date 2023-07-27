import express from 'express';
import { PostMapper } from '../mappers/PostMapper';

const router = express.Router();

router.get('/posts', async (req, res) => {
    const postsDTO = await PostMapper.toDTO();
    res.json(postsDTO);
});

export default router;
