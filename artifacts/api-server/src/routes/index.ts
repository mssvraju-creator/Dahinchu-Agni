import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import notificationsRouter, { startNotificationPoller } from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(notificationsRouter);

// Start background poller for live-stream and new-video notifications
startNotificationPoller();

export default router;
