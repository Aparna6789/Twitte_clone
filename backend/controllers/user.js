const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SECRET_KEY = "knsincjjscbjdcjbbbej3e3u8b";

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        error: "Password must contain at least one uppercase letter",
      });
    }

    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/.test(password)) {
      return res.status(400).json({
        success: false,
        error: "Password must contain at least one special symbol",
      });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Singup DOne",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while registering the user",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({ success: true, message: "User signed in successfully", token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while signing in" });
  }
};
