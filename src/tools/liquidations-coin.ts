import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type { CoinAggregatedLiquidationPoint } from "../types/liquidations.js";

const paramsSchema = z.object({
	exchange_list: z
		.string()
		.min(1)
		.describe(
			"Comma-separated exchanges to aggregate, e.g., Binance,OKX,Bybit",
		),
	symbol: z.string().min(1).describe("Coin symbol, e.g., BTC"),
	interval: z
		.enum([
			"1m",
			"3m",
			"5m",
			"15m",
			"30m",
			"1h",
			"4h",
			"6h",
			"8h",
			"12h",
			"1d",
			"1w",
		])
		.default("1d")
		.optional(),
	limit: z.number().int().min(1).max(4500).optional(),
	start_time: z.number().int().optional(),
	end_time: z.number().int().optional(),
	prettyFormat: z
		.boolean()
		.default(true)
		.optional()
		.describe(
			"When true (default), returns a human-readable summary; when false, returns raw API-shaped data.",
		),
});

type Params = z.infer<typeof paramsSchema>;

export const liquidationsCoinTool = {
	name: "COINGLASS_LIQUIDATIONS_COIN",
	description: "Get aggregated liquidation history for a coin across exchanges",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const data = await svc.getCoinAggregatedLiquidationsHistory({
				exchange_list: params.exchange_list,
				symbol: params.symbol,
				interval: params.interval || "1d",
				limit: params.limit,
				start_time: params.start_time,
				end_time: params.end_time,
			});

			if (params.prettyFormat !== false) {
				return convertCoinToPretty(params.symbol, data);
			}

			return `${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching coin aggregated liquidations: ${error}`;
		}
	},
};

function convertCoinToPretty(
	symbol: string,
	data: CoinAggregatedLiquidationPoint[],
): string {
	const latest = data[data.length - 1];
	const totals = data.reduce(
		(acc, p) => ({
			long: acc.long + Number(p.aggregated_long_liquidation_usd || 0),
			short: acc.short + Number(p.aggregated_short_liquidation_usd || 0),
		}),
		{ long: 0, short: 0 },
	);

	const summary = dedent`
		Liquidations (Coin Aggregated) for ${symbol} [${data.length} points]:
		Latest: Long $${(
			Number(latest?.aggregated_long_liquidation_usd || 0) / 1_000_000
		).toFixed(2)}M | Short $${(
			Number(latest?.aggregated_short_liquidation_usd || 0) / 1_000_000
		).toFixed(2)}M
		Totals: Long $${(totals.long / 1_000_000).toFixed(2)}M | Short $${(
			totals.short / 1_000_000
		).toFixed(2)}M
	`;

	return `${summary}\n\n${JSON.stringify({ latest, totals, points: data }, null, 2)}`;
}
