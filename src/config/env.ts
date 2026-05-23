import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  port: process.env.PORT as string,
  connection_string: process.env.CONNECTIONSTRING as string,
  node_env: process.env.NODE_ENV as string,
  jwt_secret: process.env.JWT_SECRET as string,
};
