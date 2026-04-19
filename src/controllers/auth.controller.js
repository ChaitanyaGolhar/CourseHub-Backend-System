const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../repositories/user.repo");

async function signup(req, res) {
  try {
    const { email, password } = req.validateData.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "user already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    await createUser(email, hash);

    return res.status(201).json({ message: "user created" });
  } catch {
    return res.status(500).json({ message: "internal server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.validateData.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch {
    return res.status(500).json({ message: "internal server error" });
  }
}

module.exports = { signup, login };