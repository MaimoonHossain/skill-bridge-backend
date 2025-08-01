import multer from "multer";

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
}).fields([
  { name: "resume", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
  { name: "logo", maxCount: 1 }, // For company logo
]);
