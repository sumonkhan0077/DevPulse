import { Router } from "express";
import { issuesController } from "./issues.controller";
import { auth, authorizeRoles } from "../../middleware/auth";

const router = Router();

router.post("/", auth, issuesController.createIssues);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);
router.patch(
  "/:id",
  auth,
  authorizeRoles("maintainer", "contributor"),
  issuesController.updateIssue,
);
router.delete(
  "/:id",
  auth,
  authorizeRoles("maintainer"),
  issuesController.deleteIssue,
);

export const issuesRouter = router;
