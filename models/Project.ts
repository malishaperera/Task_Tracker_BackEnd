import { Schema, model, Types } from 'mongoose';

interface IProject {
    title: string;
    user: Types.ObjectId;
    tasks:Types.ObjectId[];
}

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
});

export const Project = model<IProject>('Project', projectSchema);