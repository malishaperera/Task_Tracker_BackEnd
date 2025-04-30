import { Schema, model } from 'mongoose';

// Task Status  ENUM
enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in-progress',
    DONE = 'done',
}

// Task Interface
interface ITask {
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: Date;
    completedAt: Date | null;
    project: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
}

// Task Schema
const taskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.TODO,
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export const Task = model<ITask>('Task', taskSchema);