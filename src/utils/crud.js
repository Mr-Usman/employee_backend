import dateFormat from "dateformat";

import User from "../resources/user/user.model";

import { SHIFT_TIME } from "../config";

/** Create New User*/
export const createUser = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const user = await model.create(req.body);
      res.status(201).json({ message: "User added into account", data: user });
    }
  } catch (e) {
    res
      .status(400)
      .send({ message: "Role Must be a Manager", error: e.message });
  }
};
/** Edit User */
const updateUser = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { id } = req.params;
      const updatedUser = await model
        .findByIdAndUpdate(id, req.body, { new: true })
        .exec();
      await updatedUser.save();
      res
        .status(201)
        .json({ message: "User info updated into account", data: updatedUser });
    }
  } catch (e) {
    res
      .status(400)
      .send({ message: "Role Must be a Manager", error: e.message });
  }
};

/** Delete User  */
const deleteUser = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { id } = req.params;
      const removedUser = await model.findByIdAndRemove(id);
      res
        .status(201)
        .json({ message: "User info removed from account", data: removedUser });
    }
  } catch (e) {
    res
      .status(400)
      .send({ message: "Role Must be a Manager", error: e.message });
  }
};

const reset = model => async (req, res) => {
  try {
    const { user } = req;
    const oldPassword = user.checkPassword(user, req.body.password);
    if (!oldPassword) {
      return res.status(400).send({ message: "old password doesn't match. " });
    }
    if (req.body.password != req.body.confirmPassword) {
      return res
        .status(400)
        .send({ message: "confirmPassword doesn't match. " });
    }
    user.password = req.body.password;
    // const newUser = new model(u);
    await user.save();
  } catch (e) {
    res.status(400).send({ message: "password is updated!" });
  }
};

/** Root Object For User CRUD operations */
export const crudControllers = model => ({
  createUser: createUser(model),
  updateUser: updateUser(model),
  deleteUser: deleteUser(model),
  reset: reset(model)
});

/** Create Task for User */
const createTask = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { email } = req.body;
      const user = await User.findOne({ email }).exec();
      const newTask = await model.create({
        title: req.body.title,
        description: req.body.description,
        deadline: Date.now(),
        assignedBy: req.user._id,
        userId: user._id
      });
      res
        .status(201)
        .json({ message: "task has assigned to user", data: newTask });
    }
  } catch (e) {
    res
      .status(400)
      .send({ message: "Role Must be a Manager", error: e.message });
  }
};

/** Root Object For Task CRUD operations */
export const taskControllers = model => ({
  createTask: createTask(model)
});

const timeIn = model => async (req, res) => {
  const now = new Date();
  const checkIn = dateFormat(now, "h");
  const Day = dateFormat(now, "d");
  const checkInTime = await model.create({
    checkIn,
    Day,
    userId: req.body.userId
  });
  res.status(201).json({ message: "Checkin Time Noted." });
};

const timeOut = model => async (req, res) => ({});

export const timingControllers = model => ({
  timeIn: timeIn(model),
  timeOut: timeOut(model)
});
