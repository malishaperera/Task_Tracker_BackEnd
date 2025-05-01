import express from "express";

import {authenticate} from "../middlewares/auth.middleware";
import {createProject, deleteProject, getProject, getAllProjects, updateProject} from "../controllers/projects.controller";


const router = express.Router();

router.post("/",authenticate,createProject);
router.put("/:projectId",authenticate,updateProject);
router.get("/:projectId", authenticate, getProject);
router.get("/", authenticate, getAllProjects);
router.delete("/:projectId", authenticate, deleteProject);


export default router;