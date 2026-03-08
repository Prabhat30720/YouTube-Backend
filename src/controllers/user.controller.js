import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Method to generate access and refresh tokens.

const generateAccessAndRefreshTokens = async (userId) => {
  // Here, user is nothing but a mongoose object with user details

  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // storing the generated reefresh token in user database, so that user doesn't need to login multiple times, even if the access token gets expired.

  user.refreshtoken = refreshToken;

  // saving the refresh token in user database without running the validation because we are not updating any user details here, we are just saving the refresh token in database.

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
  try {
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Here we will write the logic to register the user and save the user in database
  // get user detils from frontend
  // validation - not empty
  // check if user already exists: username, email.
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in DB
  // remove password and refresh token field from response
  // check for user creation
  // return res

  console.log("req.body:", req.body);

  // data is coming from Form or body
  const { fullName, email, username, password } = req.body;

  // validation - check if any field is empty

  if ([fullName, email, username, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists: username, email.

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  console.log("req.files:", req.files);

  // check for images, check for avatar

  // Just like we have req.body for text data, we have files coming from frontend in req.files, and the name of the field in form data is avatar and coverImage, so we can access them using req.files.avatar and req.files.coverImage

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // Here we are checking if the coverImage file is present in the request, if yes then we are getting the local path of that file, otherwise we will keep the coverImagelocalPath variable undefined.

  let coverImagelocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload them to cloudinary, avatar

  // Why await because uploading the image on clodinary or any third party service is an asynchronous operation, it may take some time, so we will wait for the response from cloudinary before moving to the next line of code.

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImagelocalPath);

  // Check if avatar file is uploaded on cloudinary

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // create user object - create entry in DB

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    // check if coverImage is uploaded on cloudinary, if yes then save the url in database otherwise save empty string
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response

  // First check if user is created or not, and check the databaase entery.

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // return res

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // here we will write the logic to login the user
  // req.body --> data
  // username or email based login access
  // find the user
  // password check
  // access and refresh token generation
  // send cookies and response

  // destructuring the data coming from frontend in req.body.

  const { email, username, password } = req.body;

  // check if uer is registered with the given email or username in database for login access, if not then throw an error.

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required for login");
  }

  // logic to check the first entry of username or email from database.

  // await ---> because finding the user from database is an asynchronous operation, it may take some time, so we will wait for the response from database before moving to the next line of code.

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // check if user exists, if not then throw an error.

  if (!user) {
    throw new ApiError(404, "User does not exist, please register first");
  }

  // check user password is correct or not by using the method we created in user.model.js file.

  const isPasswordValid = await user.isPasswordCorrect(password);

  // if password is not valid then throw an error.

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // access and refresh token generated by the above method we created, and we are passing the user id to that method to generate the tokens.

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Here we don't want to send the refresh token and password in response, so we will remove the password and refresh token in response because it is a sensitive information, so we will send it in http only cookies, so that it cannot be accessed by javascript in frontend.

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // cookies can only be modified or accessed by the server, not by the client side javascript

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        // here we will send the user details, access token and refresh token in response
        // Why are we sending the access token and refresh token again? because we are handling a case where user may be using a mobile application or any third party client where cookies are not supported, in that case we can send the access token and refresh token in response, so that client can store it in their local storage and use it for subsequent requests.
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // req.user._id --> we will get the user id from the req.user object which we have attached in the verifyJWT middleware after verifying the access token, so that only authenticated user can access this logout route, and we can get the user id from the req.user object and then we can find the user in database and remove the refresh token from database, so that user will be logged out and cannot use the refresh token to get new access token.

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        // set the refresh token to undefined in database, so that user will be logged out

        refreshToken: undefined,
      },
    },
    {
      // returns the updated document after the update is applied, not the original document before the update.
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // clearCookie method we get from cookie-parser

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
