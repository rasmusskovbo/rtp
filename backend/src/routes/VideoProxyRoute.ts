import express, { Request, Response } from 'express';

const videoProxyRoute: express.Router = express.Router();

videoProxyRoute.get('/proxy', (req: Request, res: Response) => {
    let fileId = req.query.id as string;

    if (!fileId) {
        return res.status(400).send('File ID is required');
    }

    console.log(fileId)

    // Check if fileId contains the full URL and extract the actual ID
    if (fileId.startsWith('http')) {
        const url = new URL(fileId);
        fileId = url.searchParams.get('id') || fileId;
    }

    console.log("New fileID: " + fileId)

    // Generate the Google Drive embed URL
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    // Send the embed URL back to the client
    res.json({ embedUrl });
});

export default videoProxyRoute;
