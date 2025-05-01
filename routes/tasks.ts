import express from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {createTask} from "../controllers/task.controller";



const router = express.Router();


router.post("/:projectId/tasks", authenticate, createTask);

// router.put("/tasks/:taskId", auth, updateTask);     // Update Task
// router.delete("/tasks/:taskId", auth, deleteTask);  // Delete Task

export default router;