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
    res.status(400).json({ message: 'some problem occured.'})
  }
};

// const approveShift = () => async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email }).exec();
//     if (req.user.role === "manager" && user.role === "developer") {
//       const timing = await Timing.findOne({ userId: user._id }).exec();
//       timing.dropShift[0].aprovedStatus = true;
//       await timing.save();
//       res.status(200).json({ message: "user dropped shift approved." });
//     }
//   } catch (e) {
//     console.log(e.message);
//   }
// };

const approveShift = () => async (req, res) => {
  try{
      if(req.user.role === "manager") {
        const {timeId, userId } = req.body;
        let updatedTiming = await Timing.findOne({ userId }).exec();
        let { dropShift } = updatedTiming;
        dropShift = dropShift.filter( shift => shift._id.toString() !== timeId.toString());
        console.log(dropShift);
        updatedTiming.dropShift = dropShift;
        const newTiming = await updatedTiming.save();
        res.status(200).json(newTiming.dropShift);
      }
  } catch(e){
    console.log(e.message);
    res.status(400).json({ message: 'some problem occured.'})
  }
}

const swapShift = () => async (req, res) => {
  try {
    const { _id } = req.user;
    const { day, email } = req.body;
    //find th user with its email
    const user = await User.findOne({ email }).exec();
    //find the user timingshift array
    let shiftTiming = await Timing.findOne({ userId: user._id }).exec();
    //remove the day from the shiftTiming array
    let newshiftTiming = shiftTiming.weekShift.filter(item => item.day != day);
    //on which day we want o swap shift
    const specificDay = shiftTiming.weekShift.filter(
      item => item.day == day
    )[0];

    // other user with whom user want to swap his shift
    //find the user by its email with which we want to swap our shift
    const otherUser = await User.findOne({ email }).exec();
    //find its timing shift
    const timings = await Timing.findOne({ userId: otherUser._id }).exec();

    const otherShiftTiming = timings.weekShift.filter(item => item.day === day);
    if (!otherShiftTiming.length) {
      throw new Error("The other user has not any shift that day.");
    }

    // get all the other day shift except the exchaneg one
    let allOtherShift = timings.weekShift.filter(item => item.day !== day);

    newshiftTiming.push(otherShiftTiming[0]);
    shiftTiming.weekShift = newshiftTiming;
    await shiftTiming.save();

    allOtherShift.push(specificDay);
    timings.weekShift = allOtherShift;
    await timings.save();
    res.status(200).json({ message: "shift has been swaped" });
  } catch (e) {
    console.log(e.message);
  }
};

const timing = (model) => async (req, res) => {
   try{
   const { _id } = req.user;
   const timing = await Timing.findOne({userId: _id }).exec();
   res.status(200).json(timing)
   } catch(e){
    console.log(e.message)
    res.status(400).json({ message: 'some problem occured.'})
   }
}

const getDropShifts = () => async (req, res) => {
   try {
    if(req.user.role === "manager") {
      const { userId } = req.body;
      const timing = await Timing.findOne({ userId }).exec();
      // console.log(timing.dropShift)
      res.status(200).json(timing.dropShift);
      return;
    }
   } catch(e){
     console.log(e.message);
    res.status(400).json({ message: 'some problem occured.'})
   }
}

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
  getDropShifts: getDropShifts()
});

/** Create Task for User */
const createTask = model => async (req, res) => {
  try {
    if (req.user.role === "manager") {
      let { email, deadline, title, description } = req.body;
      let dateObj = new Date(deadline);
      let momentObj = moment(dateObj);
      deadline = momentObj.format("YYYY-MM-DD HH:mm");
      const user = await User.findOne({ email }).exec();
      const newTask = await model.create({
        title,
        description,
        deadline,
        assignedBy: req.user._id,
        userId: user._id
      });
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
    if(req.user.role === "manager"){
      let { weekShift, _id } = req.body;
      const newTiming = weekShift.map( time => {
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
        }
      });
      weekShift = newTiming;
      const timing = await model.create({ weekShift, userId: _id });
      res
        .status(201)
        .json({ message: "Shift added for relevant User", data: timing });
    }
    // const { weekShift, email } = req.body;
    // const userId = await User.findOne({ email })
    //   .select("id")
    //   .exec();
    // const testing =
    //   weekShift &&
    //   weekShift.map(item => {
    //     item.startTime = dateFormat(
    //       item.startTime,
    //       "dddd, mmmm dS, yyyy, h:MM:ss TT"
    //     );
    //     item.endTime = dateFormat(
    //       item.endTime,
    //       "dddd, mmmm dS, yyyy, h:MM:ss TT"
    //     );
    //     return item;
    //   });
    // req.body.userId = userId;
  } catch (e) {
    res.status(400).send({
      error: e.message
    });
  }
};

/** drop shift of an employee */
// const dropShift = model => async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { name } = req.body;

//     const timeShift = await model.findOne({ userId: _id }).exec();
//     console.log(timeShift);
//   } catch (e) {
//     console.log(e.message);
//   }
// };

export const timingControllers = model => ({
  assigntiming: assigntiming(model)
  // dropShift: dropShift(model)
});
