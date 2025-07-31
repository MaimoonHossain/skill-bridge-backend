import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
import { uploadMiddleware } from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/register")
  .post(isAuthenticated, uploadMiddleware, registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").patch(isAuthenticated, updateCompany);

export default router;
