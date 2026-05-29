import { z } from "zod";

export const detectDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "请输入域名")
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "请输入有效的域名格式，如 example.com",
    ),
});

export type DetectDomainInput = z.infer<typeof detectDomainSchema>;
