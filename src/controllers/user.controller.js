import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  // validate user details - not empty
  if (!fullName || !email || !username || !password) {
    throw new apiError(400, "Please fill all fields");
  }
  // check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new apiError(409, "User already exists");
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
    throw new apiError(400, "Please upload avatar image");
  }

  // upload images to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverLocalPath);
  if (!avatar) {
    throw new apiError(500, "Error uploading Avatar image");
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
        throw new apiError(500, "Error creating user")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"))

  // remove password and refresh token from response

  // check for user creation


  // return response
});

export default registerUser;
