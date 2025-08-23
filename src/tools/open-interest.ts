import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";

const paramsSchema = z.object({
	symbol: z.string().min(1).describe("Base asset symbol, e.g., BTC or BTCUSDT"),
	exchange: z
		.string()
		.optional()
		.describe("Optional exchange filter, e.g., Binance"),
	includeHistory: z.boolean().default(false).optional(),
	period: z.enum(["1h", "4h", "12h", "24h"]).optional(),
});

type Params = z.infer<typeof paramsSchema>;

export const openInterestTool = {
	name: "COINGLASS_OPEN_INTEREST",
	description:
		"Get open interest exchange list and optional OI history for a symbol",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const symbol = params.symbol.endsWith("USDT")
				? params.symbol
				: `${params.symbol.toUpperCase()}USDT`;

			const exchangeList = await svc.getOpenInterestExchangeList(
				symbol.replace("USDT", ""),
			);

			let history: unknown;
			if (params.includeHistory) {
				const intervalMap: Record<string, string> = {
					"1h": "1h",
					"4h": "4h",
					"12h": "12h",
					"24h": "1d",
				};
				const interval = intervalMap[params.period || "24h"];
				history = await svc.getOpenInterestHistory({
					symbol,
					exchange: params.exchange,
					interval,
					limit: 48,
				});
			}

			// biome-ignore lint/suspicious/noExplicitAny: <>
			const aggregated = exchangeList.find((e: any) => e.exchange === "All");
			const change24h = aggregated?.open_interest_change_percent_24h ?? 0;
			const summary = dedent`
      Open Interest for ${symbol}:
      Total OI (All): $${Number(aggregated?.open_interest_usd || 0).toFixed(0)}
      24h Change: ${Number(change24h).toFixed(2)}%
    `;

			return `${summary}\n\n${JSON.stringify({ exchangeList, history }, null, 2)}`;
		} catch (error) {
			return `Error fetching open interest: ${error}`;
		}
	},
};
