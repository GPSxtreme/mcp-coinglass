import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";

const paramsSchema = z.object({
	symbol: z.string().min(1).describe("Base asset symbol, e.g., BTC or BTCUSDT"),
	exchange: z
		.string()
		.optional()
		.describe("Optional exchange filter, e.g., Binance"),
});

type Params = z.infer<typeof paramsSchema>;

export const fundingRateTool = {
	name: "COINGLASS_FUNDING_RATE",
	description: "Get current funding rate across exchanges for a symbol",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const baseSymbol = params.symbol.toUpperCase().replace(/USDT$/, "");
			const list = await svc.getFundingRateExchangeList(
				baseSymbol,
				params.exchange,
			);

			// biome-ignore lint/suspicious/noExplicitAny: external shape
			const exchanges = (list as any[]).map((e) => ({
				exchange: e.exchangeName || e.exchange || "Unknown",
				rate: Number(e.rate ?? 0),
				nextFundingTime: Number(e.nextFundingTime ?? 0),
			}));

			const avg = exchanges.length
				? exchanges.reduce(
						(s, e) => s + (Number.isNaN(e.rate) ? 0 : e.rate),
						0,
					) / exchanges.length
				: 0;

			const next =
				exchanges.find((e) => e.nextFundingTime)?.nextFundingTime || 0;

			const summary = dedent`
      Funding Rate for ${baseSymbol}USDT:
      Average: ${(avg * 100).toFixed(4)}% | Next Funding: ${next ? new Date(next).toISOString() : "unknown"}
      Exchanges: ${exchanges.length}
    `;

			return `${summary}\n\n${JSON.stringify(
				{ averageRate: avg, nextFundingTime: next, exchanges },
				null,
				2,
			)}`;
		} catch (error) {
			return `Error fetching funding rate: ${error}`;
		}
	},
};
