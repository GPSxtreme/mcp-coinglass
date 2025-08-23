import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
	COINGLASS_API_BASE_URL: z
		.string()
		.default("https://open-api-v4.coinglass.com"),
	COINGLASS_API_KEY: z.string().min(1),
	COINGLASS_API_RATE_LIMIT: z.number().default(250),
});

export const env = envSchema.parse(process.env);
