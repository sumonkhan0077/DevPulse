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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getSingleIssueService(
      req.params.id as string,
    );

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue fetched successfully",
      data: result,
    });

  } catch (error: any) {
    console.log("GET SINGLE ISSUE ERROR:", error);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const currentUser = req.user;

    const result = await issuesService.updateIssueService(
      id as string,
      payload,
      currentUser,
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });

  } catch (error: any) {
    console.log("UPDATE ISSUE ERROR:", error);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};


const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.deleteIssueService(id as string);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found or already deleted",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null,
    });

  } catch (error: any) {
    console.log("DELETE ISSUE ERROR:", error);

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