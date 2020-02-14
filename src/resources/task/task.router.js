import { Router } from "express";
import controller from "./task.controller";

const router = Router();

router
.route("/create")
.post(controller.createTask)

router
.route("/all")
.get(controller.getAllTasks)

export default router;