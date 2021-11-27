import express from 'express';
const router = express.Router();

router.get("/session", (req, res) => {
    res.send(req.session)
})

export default router