import express, { Request, Response, NextFunction } from 'express';
import googleOAuthApiRoutes from './googleOAuthApiRoutes';
import exampleAppApiRoutes from './exampleAppApiRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
const https = require('https');
const fs = require('fs');
https.globalAgent.options.ca = fs.readFileSync('./ca-crt.pem');
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(googleOAuthApiRoutes, exampleAppApiRoutes);

// #region Helper Functions

// Custom error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(error); //TODO: Remove
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.status || 500).json({
        error: {
            message: error.message || 'An unknown error occurred.',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }) // Include stack trace in development mode
        }
    });
  });
  
  // Handle unknown routes
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  // #endregion
  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
