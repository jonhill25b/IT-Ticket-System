import { requireRole } from "../middleware/auth";
import type { Request, Response, NextFunction } from "express";

describe("RBAC Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should call next() for allowed role", () => {
    mockReq = { user: { userId: 1, email: "admin@test.com", role: "ADMIN" } };
    const middleware = requireRole("ADMIN");
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should return 403 for disallowed role", () => {
    mockReq = { user: { userId: 1, email: "user@test.com", role: "USER" } };
    const middleware = requireRole("ADMIN");
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    mockReq = {};
    const middleware = requireRole("ADMIN");
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should allow multiple roles", () => {
    mockReq = { user: { userId: 1, email: "agent@test.com", role: "AGENT" } };
    const middleware = requireRole("ADMIN", "AGENT");
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
