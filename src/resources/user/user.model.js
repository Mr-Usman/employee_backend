import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "manager", "developer"],
    required: true
  },
  token: {
    type: String
  },
  permissions: [
    {
      type: String,
      required: true
    }
  ],
  token: {
    type: String
  }
});

userSchema.methods.checkPassword = async (user, password) => {
  const passwordHash = user.password;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err);
      }
      resolve(same);
    });
  });
};

//hooks
userSchema.pre("save", function(next) {
  var user = this;

  bcrypt.genSalt(8, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

//Instance method
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "mobileLIVE");
  user.token = token;
  await user.save();

  return token;
};

const User = mongoose.model("user", userSchema);

export default User;
