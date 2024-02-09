// import {asyncHandler} from "../utils/asyncHandler.js"
// import ApiError from "../utils/ApiError";
// import jwt from "jsonwebtoken";
// import { User } from "../models/user.model";


// export const verifyJWT = asyncHandler (async(req, res, next) => {
//   try {
//     // get the token
//     const token = req.cookies.accessToken;
//     // if no token
//     if(!token){
//       throw new ApiError(401, "Unauthorized")
//     }
//     // verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // find the user
//     const user = await User.findById(decoded.id);
//     // if no user
//     if(!user){
//       throw new ApiError(401, "Unauthorized")
//     }
//     // set the user in the request object
//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(401, error?.message ||  "Unauthorized")
//   }
// })

import asyncHandler  from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"; // Make sure to include the file extension
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // Make sure to include the file extension

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // get the token
    const token = req.cookies.accessToken;
    // if no token
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    // verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // find the user
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    // if no user
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    // set the user in the request object
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || "Unauthorized"));
  }
});
