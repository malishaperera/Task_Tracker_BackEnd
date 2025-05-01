import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./database/db";
import authRouter from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


//route
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Start server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});