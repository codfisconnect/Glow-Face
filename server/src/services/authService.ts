import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabase } from "../config/database.js";
import { ENV } from "../config/env.js";
import { User, Role } from "../types/index.js";
import { HttpError } from "../middleware/errorHandler.js";

export class AuthService {
  async register(params: {
    email: string;
    password?: string;
    name?: string;
    phone?: string;
    role?: Role;
  }): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const { email, password, name, phone, role = "CUSTOMER" } = params;

    if (!email || !email.includes("@")) {
      throw new HttpError(400, "A valid email address is required.");
    }
    if (!password || password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters long.");
    }

    const { type, db } = getDatabase();
    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    if (type === "prisma") {
      const existing = await db.user.findUnique({ where: { email: cleanEmail } });
      if (existing) throw new HttpError(400, "An account with this email already exists.");
    } else {
      const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) throw new HttpError(400, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const now = new Date();

    const newUser: User = {
      id: userId,
      email: cleanEmail,
      name: name || null,
      phone: phone || null,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now
    };

    if (type === "prisma") {
      await db.user.create({
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          passwordHash: newUser.passwordHash,
          role: newUser.role
        }
      });
    } else {
      db.users.set(userId, newUser);
    }

    const token = this.generateToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;
    return { user: userSafe, token };
  }

  async login(params: {
    email: string;
    password?: string;
  }): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const { email, password } = params;

    if (!email || !password) {
      throw new HttpError(400, "Email and password are required.");
    }

    const { type, db } = getDatabase();
    const cleanEmail = email.toLowerCase().trim();
    let user: any;

    if (type === "prisma") {
      user = await db.user.findUnique({ where: { email: cleanEmail } });
    } else {
      user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user || !user.passwordHash) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = this.generateToken(user);
    const { passwordHash: _, ...userSafe } = user;
    return { user: userSafe, token };
  }

  async getProfile(userId: string): Promise<Omit<User, "passwordHash">> {
    const { type, db } = getDatabase();
    let user: any;

    if (type === "prisma") {
      user = await db.user.findUnique({
        where: { id: userId },
        include: { addresses: true }
      });
    } else {
      user = db.users.get(userId);
    }

    if (!user) throw new HttpError(404, "User account not found.");
    const { passwordHash: _, ...userSafe } = user;
    return userSafe;
  }

  private generateToken(user: User): string {
    if (!ENV.JWT_SECRET) {
      throw new HttpError(500, "Authentication configuration missing on server.");
    }
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: (ENV.JWT_EXPIRES_IN as any) || "7d" }
    );
  }
}

export const authService = new AuthService();
