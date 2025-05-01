import { Request, Response } from "express";
import {Task, TaskStatus} from "../models/Task";
import { Project } from "../models/Project";

export const createTask = async (req: Request, res: Response):Promise<void> => {
    try {
        const { projectId } = req.params;
        const { title, description } = req.body;
        const userId = req.user?.id;

        // 1. Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
             res.status(404).json({ error: "Project not found" });
            return
        }

        // 2. Create new task
        const task = new Task({
            title,
            description,
            project: projectId,
            user: userId,
            status: TaskStatus.TODO
        });

        await task.save();

        // 3. Add task to project's task list
        project.tasks.push(task._id);
        await project.save();

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};