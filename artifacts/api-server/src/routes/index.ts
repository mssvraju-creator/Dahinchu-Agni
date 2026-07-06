import { Router } from "express";
import healthRouter from "./health.js";
import youtubeRouter from "./youtube.js";
import notificationsRouter, { startNotificationPoller } from "./notifications.js";
import uploadRouter from "./upload.js";
import bibleRouter from "./bible.js";

const router = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(notificationsRouter);
router.use(uploadRouter);
router.use(bibleRouter);

startNotificationPoller();

export default router;
