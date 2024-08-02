import express, {NextFunction, Request, Response, Router} from 'express';
import upload from '../aws/S3Client'
import {ContentType, PostsEntity} from "../database/entities/PostEntity";
import {getRepository} from "typeorm";
import statsRouter from "./StatsRoute";
import axios from "axios";

const videoProxyRoute: Router = express.Router();

videoProxyRoute.get('/proxy', async (req, res) => {
    const fileId = req.query.id as string;

    if (!fileId) {
        return res.status(400).send('File ID is required');
    }

    const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
        const response = await axios.get(googleDriveUrl, {responseType: 'stream'});
        res.setHeader('Content-Type', 'video/mp4'); // Change this if the video format is different
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).send('Error fetching video');
    }
});

export default videoProxyRoute;
