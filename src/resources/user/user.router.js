import { Router } from "express";
import controller from "./user.controller";

const router = Router();

router.route("/create").post(controller.createUser);

router.route("/update/:id").put(controller.updateUser);

router.route("/remove/:id").delete(controller.deleteUser);

router.route("/reset").post(controller.reset);

export default router;
