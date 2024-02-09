import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try{
      const user  = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken =  user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}  
  }catch(err){
    console.error("Error generating tokens:", err.message);
    return null;
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  // validate user details - not empty
  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "Please fill all fields");
  }
  // check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  // check for images , Avatar and Cover
  console.log("req.files", req.files);
  const avatarLocalPath = req.files.avatar[0]?.path;
  // const coverLocalPath = req.files.coverImage[0]?.path;
  let coverLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload avatar image");
  }

  // upload images to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Error uploading Avatar image");
  }
  // create user object - create entry in db
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar:avatar?.url,
        coverImage:coverImage?.url || "",
    })
    // const createdUser = await user.findById(user._id).select("-password -refreshToken")
    // const createdUser = await user.findOne(user._id).select("-password -refreshToken");
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

    if(!createdUser){
        throw new ApiError(500, "Error creating user")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"))

  // remove password and refresh token from response

  // check for user creation


  // return response
});


const loginUser = asyncHandler(async (req, res) => {
      // req body -> data
      const {email, username , password} = req.body;
      // username or email
      if(!email && !username){
        throw new ApiError(400, "Please provide email or username")
      }
      // find the user 
      const user = await User.findOne({$or: [{email}, {username}]})
      // if user not found
      if(!user){
        throw new ApiError(401, "Invalid credentials or user does not exist")
      }
      // password check
      const isPasswordValid = await user.isPasswordCorrect(password);
      if(!isPasswordValid){
        throw new ApiError(401, "Invalid password")
      }
      // access and refresh token
      const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
      
      // send cookies
      const options = {
        httpOnly: true,
        secure: true,
      }
      // return response
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(
        200, 
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
        )
      )
    });

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, 
    {
      $set:{refreshToken : undefined}
    },
    {
      new: true
    }
    )
  // clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  }
  res.clearCookie("accessToken").clearCookie("refreshToken")
  // return response
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
     throw new ApiError(401, "Unauthorized")
   }

  try {
     const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
     )
     const user = User.findById(decodedToken._id)
    if(!user){
      throw new ApiError(401, "Invalid Refresh Token") 
    }
    if(user?.refreshToken !== incomingRefreshToken){
      throw new ApiError(401, "Refresh Token is expired or used")
    }
    const options = {
      httpOnly: true,
      secure: true,
    }
    const {accessToken, NewRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)  
    .cookie("refreshToken", NewRefreshToken, options)
    .json(new ApiResponse(200, 
      {accessToken,refreshToken : NewRefreshToken},
       "Access Token refreshed successfully"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
  } 
  });

export  {
  registerUser, 
  loginUser,
  logoutUser,
  refreshAccessToken
}
