import {Request, Response, NextFunction} from "express";
import DriveError from "../errors/DriveError";

const ErrorHandler = (err: DriveError, req: Request, res: Response, next: NextFunction) => {
    const errStatus = err.code || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}

export default ErrorHandler