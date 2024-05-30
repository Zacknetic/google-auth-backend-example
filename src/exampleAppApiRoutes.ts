import { log } from 'console';
import { verifyToken } from './googleOAuth';
import { asyncHandler } from './util';
import express, { Request, Response } from 'express';

const router = express.Router();

const BASE_URL = '/api/example';

const operationLogs: { username: any; operation: any; accessTime: string }[] =
	[];

router.post(
	`${BASE_URL}/calc-product`,
	asyncHandler(async (req: Request, res: Response) => {
		const authHeader = req.headers.authorization;
		const { num1, num2 } = req.body.productRequestExample;
		if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
			const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
			const userEmail = await verifyToken(token); //no need to verify token for this example
			logOperation(userEmail, `Multiplication: ${num1} * ${num2}`); // Log the operation
		} else {
			logOperation('<Unauthenticated User>', `Multiplication: ${num1} * ${num2}`); // Log the operation
		}

		const productResponseExample = {
			num1,
			num2,
			product: num1 * num2,
		};
		
		res.status(200).json({
			message: 'Successfully performed product calculation.',
			productResponseExample,
		});
	})
);

router.post(
	`${BASE_URL}/get-logs`,
	asyncHandler(async (req: Request, res: Response) => {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
		const userEmail = await verifyToken(token);
		logOperation(userEmail, 'Get logs'); // Log the operation
		res.status(200).json({ operationLogs });
	})
);

// Example of adding to the log
function logOperation(email: any, operation: any) {
	const logEntry = {
		username: email,
		operation: operation,
		accessTime: new Date().toISOString(),
	};
	operationLogs.push(logEntry);
}

export default router;
