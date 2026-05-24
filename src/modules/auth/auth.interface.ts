export type Role = {
role: 'contributor' | "maintainer"
}


export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
};