import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Add the multer middleware to handle file uploads for avatar and coverImage fields in the registration form

// route for register the user

router.route("/register").post(
  // Middleware to handle the avatar and coverImage file with the help of multer
  upload.fields([
    {
      // Name of the filed coming from frontend form data
      name: "avatar",
      // Number of files to be uploaded
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// route for login the user

router.route("/login").post(loginUser);

// secured routes - Adding the verifyJWT middleware to the protected routes, so that only authenticated users can access those routes to log out the user

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;

// export { router };
