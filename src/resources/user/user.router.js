import { Router } from "express";
import controller from "./user.controller";

const router = Router();

router.route("/create").post(controller.create);

router.route("/all").get(controller.getAll);

router.route("/update/:id").put(controller.update);

router.route("/remove/:id").delete(controller.remove);

router.route("/timing").get(controller.timing);

router.route("/dropshift").post(controller.dropShift);

router.route("/getdropshifts").post(controller.getDropShifts);

router.route("/approveshift").post(controller.approveShift);

router.route("/getuserwithsamerole").get(controller.getUserWithSameRole);

router.route("/swapshift").post(controller.swapShift);

router.route("/getswapshifts").get(controller.getSwapShifts);

router.route("/swapday").post(controller.swapShiftDay);

router.route("/reset").post(controller.reset);

export default router;
