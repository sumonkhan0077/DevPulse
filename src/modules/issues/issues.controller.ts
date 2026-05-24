import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issuse.service";

const createIssues = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user?.id;

    if (!reporterId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized! User session not found.",
        data: null,
      });
    }

    const result = await issuesService.createIssuesService({
      title,
      description,
      type,
      reporter_id: reporterId,
    });

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });

  } catch (error: any) {
    // console.log("CREATE ISSUE ERROR:", error);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesService(req.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });

  } catch (error: any) {

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};



export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};