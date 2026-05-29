import { z } from "zod";

export const addKeywordSchema = z.object({
  keyword: z.string().min(1, "请输入关键词").max(100, "关键词过长"),
});

export type AddKeywordInput = z.infer<typeof addKeywordSchema>;
