import express from "express";
import * as AuthController from "../controllers/auth.controller";

const router = express.Router();


router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);

router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

export default router;