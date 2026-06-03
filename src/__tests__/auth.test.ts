import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

describe("Auth Validation", () => {
  describe("register", () => {
    it("should accept valid input", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "short",
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        name: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("login", () => {
    it("should accept valid input", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
