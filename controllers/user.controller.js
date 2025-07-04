import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    // Validate input
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });
    res
      .status(201)
      .json({ message: "Account created successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
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

    const userId = req.id; // Assuming userId is set in middleware
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Only update fields that are provided
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    if (bio !== undefined) user.profile.bio = bio;
    if (skills !== undefined) {
      user.profile.skills = skills.split(",");
    }

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
    return res.status(500).json({ message: "Error updating profile", error });
  }
};
