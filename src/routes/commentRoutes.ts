import { Router } from "express";
import { createComment, listComments } from "../controllers/commentController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// Already authenticated via parent router.use(authenticate) in ticketRoutes,
// but be defensive if mounted standalone.
router.use(authenticate);

router.get("/", listComments);
router.post("/", createComment);

export default router;
