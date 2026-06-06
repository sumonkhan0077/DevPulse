

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// src/db/index.ts
var import_pg = require("pg");

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection_string: process.env.CONNECTIONSTRING,
  node_env: process.env.NODE_ENV,
  jwt_secret: process.env.JWT_SECRET
};

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(80) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'contributor' CHECK (role in ('contributor', 'maintainer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
          type VARCHAR(50) NOT NULL CHECK (type in ('bug', 'feature_request')),
          status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress', 'resolved')),
          reporter_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Database connected and tables initialized successful!");
  } catch (error) {
    console.error("DB init error:", error);
  }
};

// src/modules/auth/auth.service.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var registerUserService = async (payload) => {
  const { email, name, password, role = "contributor" } = payload;
  const userCheck = await pool.query(
    `
    SELECT email FROM users WHERE email = $1`,
    [email]
  );
  if (userCheck.rows.length > 0) {
    throw new Error("Email is already registered!");
  }
  const salt = await import_bcryptjs.default.genSalt(10);
  const hashedPassword = await import_bcryptjs.default.hash(password, salt);
  const newUser = await pool.query(
    `INSERT INTO users (name , email, password, role)
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );
  return newUser.rows[0];
};
var loginUserService = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid email");
  }
  ;
  const user = userData.rows[0];
  const isPasswordValid = await import_bcryptjs.default.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = import_jsonwebtoken.default.sign(jwtPayload, config.jwt_secret, {
    expiresIn: "7d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Failed to register user. Please check your inputs.",
        data: null
      });
    }
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Register successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: null
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Failed to login user. Please check your inputs.",
        data: null
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: null
    });
  }
};

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/signup", registerUser);
router.post("/login", loginUser);
var authRouter = router;

// src/modules/issues/issues.routes.ts
var import_express2 = require("express");

// src/modules/issues/issuse.service.ts
var createIssuesService = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [
    reporter_id
  ]);
  if (userCheck.rows.length === 0) {
    throw new Error("Reporter user does not exist");
  }
  const newIssue = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporter_id]
  );
  return newIssue.rows[0];
};
var getAllIssuesService = async (query) => {
  const sort = query.sort || "newest";
  const type = query.type;
  const status = query.status;
  let baseQuery = `SELECT * FROM issues WHERE 1=1`;
  const queryValues = [];
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
      [reporterId]
    );
    const user = userResult.rows[0] || null;
    const formattedIssue = {
      id: currentIssue.id,
      title: currentIssue.title,
      description: currentIssue.description,
      type: currentIssue.type,
      status: currentIssue.status,
      reporter: user ? {
        id: user.id,
        name: user.name,
        role: user.role
      } : null,
      created_at: currentIssue.created_at,
      updated_at: currentIssue.updated_at
    };
    finalResult.push(formattedIssue);
  }
  return finalResult;
};
var getSingleIssueService = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  const currentIssue = issueResult.rows[0];
  if (!currentIssue) {
    return null;
  }
  const reporterId = currentIssue.reporter_id;
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [reporterId]
  );
  const user = userResult.rows[0] || null;
  const formattedIssue = {
    id: currentIssue.id,
    title: currentIssue.title,
    description: currentIssue.description,
    type: currentIssue.type,
    status: currentIssue.status,
    reporter: user ? {
      id: user.id,
      name: user.name,
      role: user.role
    } : null,
    created_at: currentIssue.created_at,
    updated_at: currentIssue.updated_at
  };
  return formattedIssue;
};
var updateIssueService = async (id, payload, currentUser) => {
  const { title, description, type } = payload;
  const issueQuery = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  const issue = issueQuery.rows[0];
  if (!issue) {
    throw new Error("Requested resource does not exist");
  }
  if (currentUser.role === "contributor") {
    if (issue.reporter_id !== currentUser.id) {
      throw new Error(
        "You do not have permission to update this issue. Contributors can only update their own issues."
      );
    }
    if (issue.status !== "open") {
      throw new Error(
        "Contributors can only edit issues when the status is 'open'"
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
    [title, description, type, id]
  );
  return result.rows[0];
};
var deleteIssueService = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const deleteIssue2 = await pool.query(`DELETE FROM issues WHERE id = $1`, [
    id
  ]);
  if (deleteIssue2.rowCount && deleteIssue2.rowCount > 0) {
    return {
      success: true,
      message: "Issue deleted successfully",
      deletedIssue: issueResult.rows[0]
    };
  }
};
var issuesService = {
  createIssuesService,
  getAllIssuesService,
  getSingleIssueService,
  updateIssueService,
  deleteIssueService
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user?.id;
    if (!reporterId) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized! User session not found.",
        data: null
      });
    }
    const result = await issuesService.createIssuesService({
      title,
      description,
      type,
      reporter_id: reporterId
    });
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesService(req.query);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const result = await issuesService.getSingleIssueService(
      req.params.id
    );
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue fetched successfully",
      data: result
    });
  } catch (error) {
    console.log("GET SINGLE ISSUE ERROR:", error);
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const currentUser = req.user;
    const result = await issuesService.updateIssueService(
      id,
      payload,
      currentUser
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    console.log("UPDATE ISSUE ERROR:", error);
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssueService(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found or already deleted",
        data: null
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null
    });
  } catch (error) {
    console.log("DELETE ISSUE ERROR:", error);
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      data: null
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "jwt missing!"
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = import_jsonwebtoken2.default.verify(
      token,
      config.jwt_secret
    );
    const userData = await pool.query(`SELECT * FROM users WHERE id=$1`, [
      decoded.id
    ]);
    const user = userData.rows[0];
    if (!user) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "User not found!"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 401,
      success: false,
      message: "Invalid or expired token!"
    });
  }
};
var authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "Missing, expired, or invalid JWT token"
      });
    }
    if (!roles.includes(req.user.role)) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        error: "Valid token but insufficient role/permissions"
      });
    }
    return next();
  };
};

// src/modules/issues/issues.routes.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth, issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch(
  "/:id",
  auth,
  authorizeRoles("maintainer", "contributor"),
  issuesController.updateIssue
);
router2.delete(
  "/:id",
  auth,
  authorizeRoles("maintainer"),
  issuesController.deleteIssue
);
var issuesRouter = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    stack: config.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config.port, () => {
    console.log(`server run on port ${config.port}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map