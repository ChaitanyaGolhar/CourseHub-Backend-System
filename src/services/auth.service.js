const { OAuth2Client } = require("google-auth-library");
const AppError = require("../utils/AppError");
const { findUserByEmail, findUserByGoogleId, createUser, linkGoogleToUser } = require("../repositories/user.repo");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleLoginService(idToken) {
  if (!idToken) {
    throw new AppError("idToken required", 400);
  }

  // 1. Verify token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  const email = payload.email;
  const googleId = payload.sub;
  const name = payload.name || null;
  const avatar = payload.picture || null;
  const emailVerified = payload.email_verified;

  if (!emailVerified) {
    throw new AppError("email not verified by google", 400);
  }

  // 2. Try Google ID first
  let user = await findUserByGoogleId(googleId);

  // 3. Fallback to email
  if (!user) {
    user = await findUserByEmail(email);
  }

  // 4. Create or link
  if (!user) {
    user = await createUser({
      email,
      googleId,
      name,
      avatar,
      provider: "google"
    });
  } else if (user && user.provider === "local" && !user.google_id) {
    // LINK ACCOUNT (IMPORTANT)
    user = await linkGoogleToUser(user.id, googleId);
  }

  return user;
}

module.exports = {
  googleLoginService
};