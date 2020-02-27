import dateFormat from "dateformat";

import User from "../resources/user/user.model";
import Timing from "../resources/timing/timing.model";

import mongoose from "mongoose";
import moment from "moment";

/**Get All Users */
const getAll = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const users = await model
        .find({ role: "developer" })
        .select({ email: 1, role: 1, permissions: 1 })
        .exec();
      res.status(200).json(users);
    } else {
      throw new Error("role is not authorized for this process!");
    }
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
};

/** Create New User*/
const create = model => async (req, res) => {
  try {
    if (req.user.role === "manager" && req.body.role === "developer") {
      const user = await model.create(req.body);
      res.status(201).json({ message: "User added into account", data: user });
    }
    if (req.user.role === "admin" && req.body.role === "manager") {
      const user = await model.create(req.body);
      console.log(req.body);
      res
        .status(201)
        .json({ message: "Manager added into account", data: user });
    } else {
      throw new Error("role is not authorized for this process!");
    }
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
};
/** Edit User */
const update = model => async (req, res) => {
  try {
    if (req.user.role === "admin" && req.body.role === "manager") {
      const { id } = req.params;
      const updatedUser = await model
        .findByIdAndUpdate(id, req.body, { new: true })
        .exec();
      await updatedUser.save();
      res
        .status(201)
        .json({ message: "User info updated into account", data: updatedUser });
    }
    if (req.user.role === "manager" && req.body.role === "developer") {
      const { id } = req.params;
      const updatedUser = await model
        .findByIdAndUpdate(id, req.body, { new: true })
        .exec();
      await updatedUser.save();
      res
        .status(201)
        .json({ message: "User info updated into account", data: updatedUser });
    } else {
      throw new Error("role is not authorized for this process!");
    }
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
};

/** Delete User  */
const remove = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { id } = req.params;
      const removedUser = await model.findByIdAndRemove(id);
      const updatedList = await model.find({ role: "developer" }).exec();
      res
        .status(201)
        .json({ message: "User info removed from account", data: updatedList });
    }
    if (req.user.role === "admin" && req.body.role === "manager") {
      const { id } = req.params;
      const removedUser = await model.findByIdAndRemove(id);
      res
        .status(201)
        .json({ message: "User info removed from account", data: removedUser });
    } else {
      throw new Error("role is not authorized for this process!");
    }
  } catch (e) {
    res.status(400).send({
      message: e.message
    });
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

const dropShift = () => async (req, res) => {
  try {
    const { _id } = req.user;
    const { day } = req.body;
    const timing = await Timing.findOne({ userId: _id }).exec();
    const { weekShift } = timing.toJSON();
    const newShiftArray = weekShift.filter(item => item.day !== day);
    timing.weekShift = newShiftArray;
    const dropShift = timing.dropShift;
    const droppedShift = weekShift.filter(item => item.day === day)[0];
    timing.dropShift = [...dropShift, droppedShift];
    await timing.save();
    res.status(201).json({ currentShift: newShiftArray, droppedShift });
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: "some problem occured." });
  }
};

const approveShift = () => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { timeId, userId } = req.body;
      let updatedTiming = await Timing.findOne({ userId }).exec();
      let { dropShift } = updatedTiming;
      dropShift = dropShift.filter(
        shift => shift._id.toString() !== timeId.toString()
      );
      updatedTiming.dropShift = dropShift;
      const newTiming = await updatedTiming.save();
      res.status(200).json(newTiming.dropShift);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: "some problem occured." });
  }
};

const swapShift = () => async (req, res) => {
  try {
    const { userIds, day } = req.body;
    const { _id } = req.user;
    // remove the swapped shift from user who wants to swap
    const timing = await Timing.findOne({ userId: _id }).exec();
    let { weekShift } = timing;
    weekShift = weekShift.filter(shift => shift.day !== day.day);
    timing.weekShift = weekShift;
    await timing.save();
    userIds.forEach(async element => {
      const user = await Timing.findOne({ userId: element });
      day["userId"] = _id;
      user.swapShift = day;
      Timing.findOneAndUpdate(
        { userId: element },
        user,
        { upsert: true },
        function(err, doc) {
          if (err) return res.send(500, { error: err });
        }
      );
    });
  } catch (e) {
    console.log(e.message);
  }
};

const timing = model => async (req, res) => {
  try {
    const { _id } = req.user;
    const timing = await Timing.findOne({ userId: _id }).exec();
    res.status(200).json(timing);
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: "some problem occured." });
  }
};

const getDropShifts = () => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const { userId } = req.body;
      const timing = await Timing.findOne({ userId }).exec();
      res.status(200).json(timing.dropShift);
      return;
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: "some problem occured." });
  }
};

const getUserWithSameRole = () => async (req, res) => {
  try {
    const { _id, role } = req.user;
    const allUsers = await User.find({
      _id: { $ne: _id },
      role,
      taskId: { $exists: true, $size: 0 }
    })
      .select("-password")
      .exec();
    res.status(200).json(allUsers);
  } catch (e) {
    console.log(e.message);
  }
};

/** get swap shifts of a specific user */
const getSwapShifts = () => async (req, res) => {
  try {
    const { user } = req;
    const timingObject = await Timing.findOne({ userId: user._id })
      .populate("userId")
      .exec();
    const { email } = timingObject.userId;
    const { swapShift } = timingObject;
    const userObj = {};
    userObj["swapShift"] = swapShift;
    userObj["email"] = email;
    res.status(200).send(userObj);
  } catch (e) {
    console.log(e.message);
  }
};

/** swap shift day */
const swapShiftDay = () => async (req, res) => {
  try {
    const { user } = req;
    const { day } = req.body;
    const newTiming = [];
    const timingObject = await Timing.findOne({ userId: user._id })
      .populate("userId")
      .exec();
    let { weekShift, swapShift } = timingObject; // userId is user object
    const newDay = weekShift.filter(shift => shift.day === day.day)[0];
    swapShift = swapShift.filter(shift => shift.day !== day.day);
    weekShift = weekShift.filter(shift => {
      if (shift.day !== day.day) {
        newTiming.push(shift);
        return shift;
      }
      if (shift.day === day.day) {
        const tempObj = {
          _id: day._id,
          day: day.day,
          startTime: day.startTime,
          endTime: day.endTime
        };
        newTiming.push(tempObj);
        return tempObj;
      }
    });
    timingObject.swapShift = swapShift;
    timingObject.weekShift = newTiming;
    await timingObject.save();
    const newT = await Timing.findOneAndUpdate(
      { userId: day.userId },
      { $push: { weekShift: newDay } },
      { new: true }
    ).exec();
    await newT.save();
  } catch (e) {
    console.log(e.message);
  }
};

/** Remove the day from weekShift of user with whom we are swaping  */
const removeShiftDay = () => async (req, res) => {};

/** Root Object For User CRUD operations */
export const crudControllers = model => ({
  getAll: getAll(model),
  create: create(model),
  update: update(model),
  remove: remove(model),
  reset: reset(model),
  timing: timing(model),
  dropShift: dropShift(),
  approveShift: approveShift(),
  swapShift: swapShift(),
  getDropShifts: getDropShifts(),
  getUserWithSameRole: getUserWithSameRole(),
  getSwapShifts: getSwapShifts(),
  swapShiftDay: swapShiftDay()
});

/** Create Task for User */
const createTask = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      let { email, deadline, title, description } = req.body;
      let dateObj = new Date(deadline);
      let momentObj = moment(dateObj);
      deadline = momentObj.format("YYYY-MM-DD HH:mm");
      let user = await User.findOne({ email }).exec();
      const newTask = await model.create({
        title,
        description,
        deadline,
        assignedBy: req.user._id,
        userId: user._id
      });
      const result = await User.updateOne(
        { _id: user._id },
        { $push: { taskId: newTask._id } }
      );
      res
        .status(201)
        .json({ message: "task has assigned to user", data: newTask });
    } else {
      throw new Error("role is not authorized for this process!");
    }
  } catch (e) {
    res.status(400).send({
      message: e.message
    });
  }
};

/** Get All Task of a User */
const getAllTasks = model => async (req, res) => {
  try {
    const { _id } = req.user;
    const allTasks = await model.find({ userId: _id }).exec();
    res.status(200).json(allTasks);
  } catch (e) {
    console.log(e.message);
  }
};

/** Root Object For Task CRUD operations */
export const taskControllers = model => ({
  createTask: createTask(model),
  getAllTasks: getAllTasks(model)
});

/** Assigning time table to employee  */
const assigntiming = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      let { weekShift, _id } = req.body;
      const newTiming = weekShift.map(time => {
        let startTimeObj = new Date(time.startTime);
        let endTimeObj = new Date(time.endTime);
        let startTimeMomentObj = moment(startTimeObj);
        let endTimeMomentObj = moment(endTimeObj);
        const startTime = startTimeMomentObj.format("DD-MM-YYYY HH:mm");
        const endTime = endTimeMomentObj.format("DD-MM-YYYY HH:mm");
        return {
          day: time.day,
          startTime,
          endTime
        };
      });
      weekShift = newTiming;
      const timing = await model.create({ weekShift, userId: _id });
      res
        .status(201)
        .json({ message: "Shift added for relevant User", data: timing });
    }
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
};

export const timingControllers = model => ({
  assigntiming: assigntiming(model)
  // dropShift: dropShift(model)
});
