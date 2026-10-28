import bcrypt from "bcryptjs";

const users = [
  {
    fullname: "admin",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    fullname: "John Rai",
    email: "johnrai@example.com",
    password: bcrypt.hashSync("password", 10),
    isAdmin: false,
  },
];

export default users;