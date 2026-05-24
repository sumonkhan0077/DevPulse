import express, { type Application, type Request, type Response } from "express"
import { authRouter } from "./modules/auth/auth.routes";

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/auth", authRouter);


export default app;