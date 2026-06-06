import { Router } from "express";
import { issuesController } from "./issues.controller";
import { auth, authorizeRoles } from "../../middleware/auth";

const route = Router();
route.post("/", auth, issuesController.createIssues);
route.get("/", issuesController.getAllIssues);
route.get("/:id", issuesController.getSingleIssue);
route.patch(
  "/:id",
  auth,
  authorizeRoles("maintainer", "contributor"),
  issuesController.updateIssue,
);
route.delete(
  "/:id",
  auth,
  authorizeRoles("maintainer"),
  issuesController.deleteIssue,
);

export const issuesRouter = route;