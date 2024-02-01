import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, username, Password } = req.body;
  console.log("email", email);

  // validate user details - not empty
  if (!fullName || !email || !username || !Password) {
    res.status(400);
    throw new apiError(400, "Please fill all fields");
  }
  // check if user already exists
  const existedUser = User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    res.status(400);
    throw new apiError(409, "User already exists");
  }
  // check for images , Avatar and Cover
  const avatarLocalPath = req.files.avatar[0]?.path;
  const coverLocalPath = req.files.coverImage[0]?.path;

  if (!avatarLocalPath) {
    res.status(400);
    throw new apiError(400, "Please upload avatar image");
  }

  // upload images to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverLocalPath);
  if (!avatar) {
    res.status(500);
    throw new apiError(500, "Error uploading Avatar image");
  }
  // create user object - create entry in db
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        Password,
        avatar:avatar?.url,
        coverImage:coverImage?.url || "",
    })
    const createdUser = await user.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        res.status(500)
        throw new apiError(500, "Error creating user")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"))

  // remove password and refresh token from response

  // check for user creation

  // return response
});

export default registerUser;
