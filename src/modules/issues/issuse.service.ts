import { pool } from "../../db";


interface IssuesQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

interface ICreateIssuePayload {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporter_id: number;
}

const createIssuesService = async (payload: ICreateIssuePayload) => {
  const { title, description, type, reporter_id } = payload;

  const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [
    reporter_id,
  ]);

  if (userCheck.rows.length === 0) {
    throw new Error("Reporter user does not exist");
  }

  const newIssue = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporter_id],
  );

  return newIssue.rows[0];
};

const getAllIssuesService = async (query: IssuesQuery) => {
  const sort = query.sort || "newest";
  const type = query.type;
  const status = query.status;

  let baseQuery = `SELECT * FROM issues WHERE 1=1`;
  const queryValues: any[] = [];

  if (type) {
    queryValues.push(type);
    baseQuery += ` AND type = $${queryValues.length}`;
  }

  if (status) {
    queryValues.push(status);
    baseQuery += ` AND status = $${queryValues.length}`;
  }

  if (sort === "oldest") {
    baseQuery += ` ORDER BY created_at ASC`;
  } else {
    baseQuery += ` ORDER BY created_at DESC`;
  }

  const issuesResult = await pool.query(baseQuery, queryValues);
  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const finalResult = [];

  for (let i = 0; i < issues.length; i++) {
    const currentIssue = issues[i];
    const reporterId = currentIssue.reporter_id;

    const userResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [reporterId],
    );
    const user = userResult.rows[0] || null;

    const formattedIssue = {
      id: currentIssue.id,
      title: currentIssue.title,
      description: currentIssue.description,
      type: currentIssue.type,
      status: currentIssue.status,
      reporter: user
        ? {
            id: user.id,
            name: user.name,
            role: user.role,
          }
        : null,
      created_at: currentIssue.created_at,
      updated_at: currentIssue.updated_at,
    };

    finalResult.push(formattedIssue);
  }

  return finalResult;
};


const getSingleIssueService = async (id: string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);
  const currentIssue = issueResult.rows[0];

  if (!currentIssue) {
    return null;
  }

  const reporterId = currentIssue.reporter_id;
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [reporterId],
  );
  const user = userResult.rows[0] || null;

  const formattedIssue = {
    id: currentIssue.id,
    title: currentIssue.title,
    description: currentIssue.description,
    type: currentIssue.type,
    status: currentIssue.status,
    reporter: user
      ? {
          id: user.id,
          name: user.name,
          role: user.role,
        }
      : null,
    created_at: currentIssue.created_at,
    updated_at: currentIssue.updated_at,
  };

  return formattedIssue;
};

const updateIssueService = async (
  id: string,
  payload: { title?: string; description?: string; type?: string },
  currentUser: any,
) => {
  const { title, description, type } = payload;

  const issueQuery = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);
  const issue = issueQuery.rows[0];

  if (!issue) {
    throw new Error("Requested resource does not exist");
  }

  if (currentUser.role === "contributor") {
    if (issue.reporter_id !== currentUser.id) {
      throw new Error(
        "You do not have permission to update this issue. Contributors can only update their own issues.",
      );
    }

    if (issue.status !== "open") {
      throw new Error(
        "Contributors can only edit issues when the status is 'open'",
      );
    }
  }

  const result = await pool.query(
    `
    UPDATE issues 
    SET 
      title = COALESCE($1, title), 
      description = COALESCE($2, description), 
      type = COALESCE($3, type), 
      updated_at = NOW() 
      WHERE id = $4
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `,
    [title, description, type, id],
  );
  return result.rows[0];
};

const deleteIssueService = async (id: string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const deleteIssue = await pool.query(`DELETE FROM issues WHERE id = $1`, [
    id,
  ]);

  if (deleteIssue.rowCount && deleteIssue.rowCount > 0) {
    return {
      success: true,
      message: "Issue deleted successfully",
      deletedIssue: issueResult.rows[0],
    };
  }
};

export const issuesService = {
  createIssuesService,
  getAllIssuesService,
  getSingleIssueService,
  updateIssueService,
  deleteIssueService,
};