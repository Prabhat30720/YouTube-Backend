import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Here is the only way to check if the user is authenticated or not, by checking the access token in the request header. If the access token is valid, then the user is authenticated and we can allow the user to access the protected routes. If the access token is invalid or expired, then we can return an error response to the user.

// Whenever we are writing a middleware, we need to make sure that we are calling the next() function at the end of the middleware, otherwise the request will be stuck in the middleware and will not reach the next middleware or the route handler.

// Parameters are error, req, res and next

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // replace the "Bearer " string with an empty string to get the actual token value from the Authorization header.

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // verify the access token with the secret key

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    ); // find the user in the database with the decoded token's _id

    if (!user) {
      // TODO: discussion about frontend
      throw new ApiError(401, "Invalid token, user does not exist");
    }

    // if user exists, then we will attach the user object to the request object, so that we can access the user information in the protected routes.

    // Add an object to req name user, name can be anything

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
