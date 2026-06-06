import type { Request, Response } from "express";

import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issuse.service";

const createIssues = async (req: Request, res: Response) => {
  const { title, description, type } = req.body;
  const reporterId = req.user?.id;

  if (!reporterId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized! User session not found.",
    });
  }
  const result = await issuesService.createIssuesService({
    title,
    description,
    type,
    reporter_id: reporterId,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Issue created successfully",
    data: result,
  });
};

const getAllIssues = async (req: Request, res: Response) => {
  const result = await issuesService.getAllIssuesService(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
};

const getSingleIssue = async (req: Request, res: Response) => {
  const result = await issuesService.getSingleIssueService(
    req.params.id as string,
  );

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: result,
  });
};

const updateIssue = async (req: Request, res: Response) => {
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
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await issuesService.deleteIssueService(id as string);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not deleted",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Issue deleted successfully",
  });
};

export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};