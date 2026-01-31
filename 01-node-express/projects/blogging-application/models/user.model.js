import mongoose from "mongoose";
import { createHmac, randomBytes } from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "/images/default-user-image.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
});

// userSchema.static("matchPassword", async function (email, password) {
//   const user = await this.findOne({ email });
//   if (!user) throw new Error("User not found");

//   const salt = user.salt;
//   const hashedPassword = user.password;
//   const userProvidedHash = createHmac("sha256", salt)
//     .update(password)
//     .digest("hex");

//   if (hashedPassword !== userProvidedHash)
//     throw new Error("Incorrect password");

//   return { ...user._doc, password: undefined, salt: undefined };
// });

userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found");

  const salt = user.salt;
  const hashedPassword = user.password;
  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (hashedPassword !== userProvidedHash)
    throw new Error("Incorrect password");
  return await this.findOne({ email }).select("-password -salt");
});
const User = mongoose.model("User", userSchema);
export default User;
