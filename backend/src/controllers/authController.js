const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    let { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    name = name.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    if (username.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }

      if (existingUser.username === username) {
        return res.status(409).json({
          message: "This username is already taken",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors?.[0]?.path;

      if (field === "username") {
        return res.status(409).json({
          message: "This username is already taken",
        });
      }

      if (field === "email") {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }

      return res.status(409).json({
        message: "Account already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
};
