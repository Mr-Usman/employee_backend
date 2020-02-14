import "./config/mongoose";

import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import userRoute from "./resources/user/user.router";
import taskRoute from "./resources/task/task.router";
import timingRoute from "./resources/timing/timing.router";

import { signin, protect } from "./utils/auth";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

/** Public Routes */
app.use("/signin", signin);

/** protected Routes */
app.use("/task", protect, taskRoute);
app.use("/user", protect, userRoute);
app.use("/manager", protect, timingRoute);

// app.use("/user", protect); // acts as middleware function

// app.use("/user", userRoute);
// app.use("/time", timingRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
