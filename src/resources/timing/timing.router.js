import { Router } from "express";
import controller from "./timing.controller";

const router = Router();

router.route("/assigntiming").post(controller.assigntiming);
// router.route("/dropshift").post(controller.dropshift);

export default router;
