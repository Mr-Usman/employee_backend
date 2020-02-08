import { Router } from "express";
import controller from "./timing.controller";

const router = Router();

router.route("/in").post(controller.timeIn);

router.route("/out").post(controller.timeOut);

export default router;
