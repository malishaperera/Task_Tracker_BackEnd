import { Schema, model } from 'mongoose';

interface IProject {
    title: string;
    user: Schema.Types.ObjectId;
    tasks: Schema.Types.ObjectId[];
}

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
});

export const Project = model<IProject>('Project', projectSchema);