import { pool } from "../../db";

export const registerUserService = async(payload: {
  email: string;
  name: string;
  password: string;
  role?: string;
})=> {
  const { email, name, password, role = "contributor" } = payload;

  const userCheck = await pool.query(`
    SELECT email FROM user WHERE email = $1 ,
    [email]
    `);
    
     if (userCheck.rows.length > 0) {
    throw new Error("Email is already registered!");
  }

}