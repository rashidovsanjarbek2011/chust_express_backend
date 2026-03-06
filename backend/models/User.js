// services/user.js

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

class UserService {
  constructor(prisma) {
    if (!prisma) {
      throw new Error("Prisma client berilmadi");
    }
    this.prisma = prisma;
  }

  /* ==============================
     CREATE / REGISTER
  ============================== */
  async createUser(data) {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone = null,
      address = null,
      avatar = null,
      role = "user",
    } = data;

    if (!username || !email || !password) {
      throw new Error("Majburiy maydonlar yetishmayapti");
    }

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (exists) {
      throw new Error("Foydalanuvchi allaqachon mavjud");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        avatar,
        role,
      },
    });
  }

  /* ==============================
     LOGIN
  ============================== */
  async login(email, password) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Email yoki parol noto‘g‘ri");
    }

    if (!user.isActive) {
      throw new Error("Foydalanuvchi bloklangan");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Email yoki parol noto‘g‘ri");
    }

    return this.getSafeProfile(user);
  }

  /* ==============================
     GET USER
  ============================== */
  async getById(id) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }

    return this.getSafeProfile(user);
  }

  async getByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /* ==============================
     UPDATE PROFILE
  ============================== */
  async updateProfile(userId, updates) {
    delete updates.password;
    delete updates.role;
    delete updates.id;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    return this.getSafeProfile(user);
  }

  /* ==============================
     CHANGE PASSWORD
  ============================== */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("Foydalanuvchi topilmadi");

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) throw new Error("Eski parol noto‘g‘ri");

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return true;
  }

  /* ==============================
     ROLE CHECKS
  ============================== */
  isAdmin(user) {
    return user.role === "admin";
  }

  isModerator(user) {
    return user.role === "moderator" || user.role === "admin";
  }

  /* ==============================
     SAFE PROFILE (NO PASSWORD)
  ============================== */
  getSafeProfile(user) {
    const { password, ...safe } = user;
    return safe;
  }
}

module.exports = UserService;
