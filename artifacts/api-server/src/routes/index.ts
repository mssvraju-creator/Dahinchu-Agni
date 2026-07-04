import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import notificationsRouter, { startNotificationPoller } from "./notifications";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(notificationsRouter);
router.use(uploadRouter);

startNotificationPoller();

export default router;
