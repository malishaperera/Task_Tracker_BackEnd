import { Request, Response } from "express";
import { Project } from "../models/Project";
import { User } from "../models/User";
import {Task} from "../models/Task";


export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title } = req.body;
        const userId = req.user?.id;

        const user = await User.findById(userId).populate("projects");
        if (user && user.projects.length >= 4) {
            res.status(400).json({ error: "Maximum 4 projects allowed" });
            return;
        }

        const project = new Project({ title, user: userId });
        await project.save();

        if (user) {
            user.projects.push(project._id);
            await user.save();
        }

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

//updateProject
export const updateProject = async (req:Request,res:Response)=>{

    const {projectId} = req.params;
    const {title} = req.body;
    const userId = req.user?.id

    try{

        const project = await Project.findById(projectId);
        if(!project){
            res.status(404).json({error:"Project not found"});
            return;
        }
        //check if user is the owner
        if (project.user.toString() !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        project.title = title || project.title;
        await project.save();

        res.status(200).json({ message: "Project updated successfully", project });

    }catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}

//getProject
export const getProject = async (req:Request,res:Response)=>{

    const {projectId} = req.params;
    const userId = req.user?.id

    try{
        const project  =await Project.findById(projectId);
        if(!project){
            res.status(404).json({error:"Project not found"});
            return;
        }
        //check if user is the owner
        if (project.user.toString() !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        res.status(200).json(project);

    }catch (err){
        res.status(500).json({ error: "Server error" });
    }
}

//getProjects
export const getAllProjects = async (req:Request,res:Response)=>{

    const userId = req.user?.id;
    try{
        const user = await User.findById(userId).populate("projects");
        if(!user){
            res.status(404).json({error:"User not found"});
            return;
        }

        res.status(200).json(user.projects);

    }catch (err){
        res.status(500).json({ error: "Server error" });
    }

}

//deleteProject
export const deleteProject = async (req:Request,res:Response)=>{

    const {projectId} = req.params;
    const userId = req.user?.id
    try{
        const project  =await Project.findById(projectId);
        if(!project){
            res.status(404).json({error:"Project not found"});
            return;
        }
        //check if user is the owner
        if (project.user.toString() !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        // await project.deleteOne({_id:projectId});
        await Task.deleteMany({ project: projectId });

        await User.updateOne(
            { _id: userId },
            { $pull: { projects: projectId } }
        );

        await project.deleteOne();
        res.status(200).json({
            message: "Project and associated tasks deleted successfully",
            deletedProject: project
        });

    }catch (err){
        res.status(500).json({ error: "Server error" });
    }
}