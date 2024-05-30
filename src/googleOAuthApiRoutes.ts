import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './util';
import { login, getIdToken } from './googleOAuth';
const router = express.Router();
const fs = require('fs');
const path = require('path');

import dotenv from 'dotenv';


dotenv.config();

const BASE_URL = '/api/auth';
const GOOGLE_URL = `${BASE_URL}/google`;

router.post(
	`${GOOGLE_URL}/login`,
	asyncHandler(async (req, res) => {
		console.log(req.body.email);
		const redirectUrl = await login(req.body.email);
		res.status(200).json({ redirectUrl });
	})
);

router.get('/callback', asyncHandler(async (req, res) => {
    const code = req.query.code as string;
	console.log(code);
    const idToken = await getIdToken(code); 
    // Path to HTML file
    const filePath = path.join(__dirname, '../public/callback.html');

    // Read in the HTML file content
    fs.readFile(filePath, { encoding: 'utf-8' }, (err: any, htmlContent: string) => {
        if (err) {
            console.error('Error reading the HTML file:', err);
            return res.status(500).send('Error loading the authentication page.');
        }

        // Replace the placeholder with the actual idToken
        const updatedHtmlContent = htmlContent.replace('RETRIEVED_ID_TOKEN', idToken);

        // Send the modified HTML content as the response
        res.send(updatedHtmlContent);
    });
}));

export default router;
