import express from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {createTask, deleteTask, getAllTask, getTask, updateTask} from "../controllers/task.controller";



const router = express.Router();


router.post("/:projectId", authenticate, createTask);
router.put("/:taskId", authenticate, updateTask);
router.get("/:taskId", authenticate, getTask);
router.get("/", authenticate, getAllTask);
router.delete("/:taskId", authenticate, deleteTask);

export default router;