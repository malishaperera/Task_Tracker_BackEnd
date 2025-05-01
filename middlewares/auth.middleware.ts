import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    email: string;
}

declare module 'express' {
    interface Request {
        user?: JwtPayload;
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Get token from "Authorization" header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
         res.status(401).json({ message: "No token, authorization denied" });
         return;
    }

    try {
        // Verify token (synchronous)
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (typeof decoded === "string") {
             res.status(403).json({ message: "Invalid token format" });
            return;
        }
        req.user = decoded as JwtPayload;
        next();
    } catch (err) {
         res.status(403).json({ message: "Invalid token" });
        return;
    }
};