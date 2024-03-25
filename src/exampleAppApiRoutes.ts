import { verifyToken } from './googleOAuth';
import { asyncHandler } from './util';
import express, { Request, Response } from 'express';

const router = express.Router();

const BASE_URL = '/api/example';

router.post(
	`${BASE_URL}/secure-action`,
	asyncHandler(async (req: Request, res: Response) => {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
		const { exampleData } = req.body;
		await verifyToken(token);

		res.status(200).json({
			message: 'Successfully performed secure-action on data.',
			exampleData,
		});
	})
);

export default router;
