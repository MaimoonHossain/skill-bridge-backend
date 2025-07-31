import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  deleteJob,
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
  updateJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/update/:id").patch(isAuthenticated, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/get-admin-jobs").get(isAuthenticated, getAdminJobs);

export default router;
