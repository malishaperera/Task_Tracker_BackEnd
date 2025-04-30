// src/models/RefreshToken.ts
import { Schema, model } from "mongoose";

interface IRefreshToken {
    token: string;
    user: Schema.Types.ObjectId;
    expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    token: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
});

export const RefreshToken = model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);