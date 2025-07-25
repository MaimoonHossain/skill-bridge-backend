import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    const files = req.files;

    // Validate input
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {}, // Default empty profile object
    };

    // ✅ Handle profile photo if provided
    if (files?.profilePhoto && files.profilePhoto[0]) {
      const fileUri = getDataUri(files.profilePhoto[0]);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "image",
        folder: "profile_photos",
      });
      newUserData.profile.profilePhoto = cloudResponse.secure_url;
    }

    // Finally create the user
    await User.create(newUserData);

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Incorrect email or password", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password", success: false });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Role mismatch", success: false });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile || {},
    };

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict", // Prevent CSRF attacks
      })
      .json({
        message: `Welcome back, ${resUser.fullName}!`,
        success: true,
        user: resUser,
      });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const logout = (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    const files = req.files; // Contains both resume and profilePhoto

    const userId = req.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Handle Resume upload
    if (files?.resume && files.resume[0]) {
      const fileUri = getDataUri(files.resume[0]);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "raw",
        folder: "resumes",
        public_id: files.resume[0].originalname, // this sets the filename
      });
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = files.resume[0].originalname;
    }

    // Handle Profile Photo upload
    if (files?.profilePhoto && files.profilePhoto[0]) {
      const fileUri = getDataUri(files.profilePhoto[0]);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "image",
        folder: "profile_photos", // Optional: store in a specific folder
      });
      user.profile.profilePhoto = cloudResponse.secure_url;
    }

    // Other profile fields
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.profile.bio = bio;
    if (skills !== undefined) user.profile.skills = skills.split(",");

    await user.save();

    const resUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile || {},
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: resUser,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      message: "Error updating profile",
      success: false,
      error: error.message,
    });
  }
};
