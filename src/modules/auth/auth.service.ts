import bcrypt from "bcryptjs";
import { pool } from "../../db";
import { config } from "../../config/env";
import jwt from "jsonwebtoken";


export const registerUserService = async(payload: {
  email: string;
  name: string;
  password: string;
  role?: string;
})=> {
  const { email, name, password, role = "contributor" } = payload;

  const userCheck = await pool.query(`
    SELECT email FROM users WHERE email = $1`, 
    [email]
    );

     if (userCheck.rows.length > 0) {
    throw new Error("Email is already registered!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password , salt)

  const newUser = await pool.query(
    `INSERT INTO users (name , email, password, role)
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );

  return newUser.rows[0];
}


export const loginUserService = async (payload: {
  email: string;
  password: string;
}) => {

     const { email, password } = payload;
  const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (userData.rows.length === 0) {
    throw new Error("Invalid email"); 
  };

   const user = userData.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

    const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

   const token = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: "7d",
  });

   return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};