import mongoose from "mongoose";

const timingSchema = new mongoose.Schema({
  email: {
    type: String,
    default: "managar@gmail.com"
  },
  weekShift: [ 
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }
  ],
  dropShift: [
    {
      day: String,
      startTime: String,
      endTime: String,
      aprovedStatus: {
        type: Boolean,
        default: false
      }
    }
  ],
  // dropShift: {
  //   day: { type: String, required: true },
  //   startTime: { type: String, required: true },
  //   endTime: { type: String, required: true }
  // },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});

const Timing = mongoose.model("timing", timingSchema);

export default Timing;
