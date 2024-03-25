// Async middleware wrapper
import  { Request, Response, NextFunction, RequestHandler }  from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Unhandled Rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // TODO: Log error to a service?
});

// Uncaught Exception
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // TODO: perform restart?
    // process.exit(1); TODO: //process managers such as PM2 will catch this and restart the process
});
