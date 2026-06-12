import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "beian-local-secret-key-2024";

export function verifyToken(token: string): { username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return decoded;
  } catch {
    return null;
  }
}
