import { registerUserService } from "./auth.service";

export const registerUser = async (req: Request, res: Response) => {
  const result = await registerUserService(req.body);

 

 
};