
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).send({
        error: "You are not logged in!",
      });
    }

    const { _id } = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).send({
        error: "User not found!",
      });
    }

    req.user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return next();

  } catch (err) {
    return res.status(401).send({
      error: "Authentication failed. Please log in again.",
    });
  }
};

const checkAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send({
      error: "You are not authorized to perform this operation!",
    });
  }

  return next();
};

export { checkAuth, checkAdmin };
