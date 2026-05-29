import { inngest } from "./client";
import { logger } from "@/lib/logger";
import { monitoringFunctions, reportFunctions } from "@/features/monitoring";

/**
 * Hello World 示例函数
 */
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    retries: 3,
  },
  { event: "app/hello-world" },
  async ({ event, step }) => {
    const result = await step.run("process-message", async () => {
      logger.info({ message: event.data.message }, "处理 hello-world 事件");
      return { processed: true, message: event.data.message };
    });

    return result;
  },
);

/**
 * 导出所有 Inngest 函数
 */
export const functions = [helloWorld, ...monitoringFunctions, ...reportFunctions];
