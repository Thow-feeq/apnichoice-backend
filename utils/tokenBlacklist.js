// server/utils/tokenBlacklist.js

const tokenBlacklist = new Set();

export const addToBlacklist = (token) => {
  console.log("🔴 Blacklisting token:", token);
  tokenBlacklist.add(token);
};

export const isBlacklisted = (token) => {
  const isBlacklisted = tokenBlacklist.has(token);
  console.log("⚠️ Token checked:", token, "→ Blacklisted?", isBlacklisted);
  return isBlacklisted;
};
