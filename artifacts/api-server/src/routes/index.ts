import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transactionsRouter from "./transactions";
import savingsGoalsRouter from "./savingsGoals";
import investmentsRouter from "./investments";
import dashboardRouter from "./dashboard";
import openaiRouter from "./openai/conversations";
import budgetsRouter from "./budgets";
import billsRouter from "./bills";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transactionsRouter);
router.use(savingsGoalsRouter);
router.use(investmentsRouter);
router.use(dashboardRouter);
router.use(openaiRouter);
router.use(budgetsRouter);
router.use(billsRouter);
router.use(reportsRouter);

export default router;
