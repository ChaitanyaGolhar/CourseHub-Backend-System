const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../repositories/user.repo");
const { success } = require("zod");
const { th } = require("zod/locales");
const AppError = require("../utils/AppError");
const { findCreatorByUserId } = require("../repositories/creator.repo");
const { googleLoginService } = require("../services/auth.service");

async function signup(req, res) {
    const { email, password } = req.validatedData.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new AppError("email already in use", 400);
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await createUser({
    email,
    password: hash,
    provider: "local"
  });

    return res.status(201).json({ 
      success: true,
      message: "signup successful"
    });
   
}

async function login(req, res) {
    const { email, password } = req.validatedData.body;

    const user = await findUserByEmail(email);
    if (!user) {
     throw new AppError("invalid credentials", 400);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError("invalid credentials", 400);
    }

    const creator = await findCreatorByUserId(user.id);

    const payload = {
      userId: user.id,
      role: user.role,
      creatorId: creator?.id || null
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "login successful",
      data: { token }
    });
}

async function googleLogin(req, res) {
  const { idToken } = req.body;

  const user = await googleLoginService(idToken);

  const creator = await findCreatorByUserId(user.id);

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      creatorId: creator?.id || null
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({
    success: true,
    message: "google login successful",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    }
  });
}

module.exports = { signup, login, googleLogin };