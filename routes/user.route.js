import express from "express";

import {
  register,
  login,
  updateProfile,
  logout,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadMiddleware } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(uploadMiddleware, register);
router.route("/login").post(login);
router
  .route("/profile/update")
  .patch(isAuthenticated, uploadMiddleware, updateProfile);
router.route("/logout").get(logout);

export default router;
