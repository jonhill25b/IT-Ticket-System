import { signToken, verifyToken, type JwtPayload } from "../lib/jwt";

describe("JWT", () => {
  const payload: JwtPayload = {
    userId: 1,
    email: "test@example.com",
    role: "USER",
  };

  it("should sign a token", () => {
    const token = signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should verify a valid token", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("should throw on invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });
});
