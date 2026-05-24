import type { Request, Response } from "express";
import { loginUserService, registerUserService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await registerUserService(req.body);
    if (!result) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Failed to register user. Please check your inputs.",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Register successful",
      data: result,
    });
    // console.log(result)
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await loginUserService(req.body);

    if (!result) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Failed to login user. Please check your inputs.",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: null,
    });
  }
};
