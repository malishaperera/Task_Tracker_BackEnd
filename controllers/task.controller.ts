import { Request, Response } from "express";
import {Task, TaskStatus} from "../models/Task";
import { Project } from "../models/Project";
import mongoose from "mongoose";

//create
export const createTask = async (req: Request, res: Response):Promise<void> => {
    try {
        const { projectId } = req.params;
        const { title, description,completedAt} = req.body;
        const userId = req.user?.id;

        //Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
             res.status(404).json({ error: "Project not found" });
            return
        }

        //Create new task
        const task = new Task({
            title,
            description,
            project: projectId,
            completedAt,
            user: userId,
            status: TaskStatus.TODO
        });

        await task.save();

        // Add task to project's task list
        project.tasks.push(task._id);
        await project.save();

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

//update
export const updateTask = async (req:Request,res:Response)=>{
    const { taskId } = req.params;
    const { title, description, status, completedAt } = req.body;
    const userId = req.user?.id;

    try {

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
             res.status(400).json({ error: "Invalid task ID" });
            return
        }

        const task = await Task.findOne({
            _id: taskId,
            user: userId
        });

        if (!task) {
             res.status(404).json({ error: "Task not found or unauthorized" });
            return
        }

        if (title) task.title = title;
        if (description) task.description = description;

        if (status) {
            if (!Object.values(TaskStatus).includes(status)) {
                 res.status(400).json({ error: "Invalid task status" });
                return
            }
            task.status = status;
            task.completedAt = status === TaskStatus.DONE ? new Date() : null;
        }
        await task.save();
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}


//get
export const getTask = async (req:Request,res:Response)=>{
    const { taskId } = req.params;
    const userId = req.user?.id;

    try {
        const task = await Task.findOne({_id: taskId,})
        if(!task){
            res.status(404).json({error:"Task not found"});
            return;
        }
        if (task.user.toString() !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        res.status(200).json(task);

    }catch (err){
        res.status(500).json({ error: "Server error" });
    }

}
//getAll
export const getAllTask = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    try {

        const tasks = await Task.find({ user: userId })
            .populate('project', 'title');

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
//delete
export const deleteTask = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    try {
        // Validate task ID format
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
             res.status(400).json({ error: "Invalid task ID" });
            return;
        }

        const task = await Task.findOneAndDelete({
            _id: taskId,
            user: userId
        });

        if (!task) {
             res.status(404).json({ error: "Task not found or unauthorized" });
            return;
        }

        // Remove task from project's tasks array
        await Project.updateOne(
            { _id: task.project },
            { $pull: { tasks: taskId } }
        );

        res.status(200).json({
            message: "Task deleted successfully",
            deletedTask: task
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};