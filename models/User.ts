import { Schema, model } from 'mongoose';

interface IUser {
    email: string;
    password: string;
    name: string;
    country: string;
    projects: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
});

export const User = model<IUser>('User', userSchema);