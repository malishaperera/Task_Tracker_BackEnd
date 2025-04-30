import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Access Token
export const generateAccessToken =(id:string, email:string,name:string,country:string) => {
    return jwt.sign(
        {id, email, name, country},
        process.env.JWT_SECRET as string,
        {expiresIn:"5h"}
    );
}

// Refresh Token
export const generateRefreshToken = (
    id: string,
    email: string
): string => {
    return jwt.sign(
        { id, email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
    );
};