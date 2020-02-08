import mongoose from "mongoose";

const timingSchema = new mongoose.Schema({
  checkIn: {
    type: Number
  },
  checkOut: {
    type: Number
  },
  Day: {
    type: String,
    required: true
  },
  overTime: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  }
});

const Timing = mongoose.model("timing", timingSchema);

export default Timing;
