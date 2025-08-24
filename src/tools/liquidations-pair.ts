import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type { PairLiquidationPoint } from "../types/liquidations.js";

const paramsSchema = z.object({
	exchange: z.string().min(1).describe("Futures exchange, e.g., Binance"),
	symbol: z.string().min(1).describe("Trading pair, e.g., BTCUSDT"),
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

export const liquidationsPairTool = {
	name: "COINGLASS_LIQUIDATIONS_PAIR",
	description: "Get liquidation history for a specific futures pair",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const data = await svc.getPairLiquidationsHistory({
				exchange: params.exchange,
				symbol: params.symbol,
				interval: params.interval || "1d",
				limit: params.limit,
				start_time: params.start_time,
				end_time: params.end_time,
			});

			if (params.prettyFormat !== false) {
				return convertPairToPretty(params.symbol, data);
			}

			return `${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching pair liquidations: ${error}`;
		}
	},
};

function convertPairToPretty(
	symbol: string,
	data: PairLiquidationPoint[],
): string {
	const latest = data[data.length - 1];
	const total = data.reduce(
		(acc, p) => {
			const longAmt = Number(p.long_liquidation_usd || 0);
			const shortAmt = Number(p.short_liquidation_usd || 0);
			return { long: acc.long + longAmt, short: acc.short + shortAmt };
		},
		{ long: 0, short: 0 },
	);

	const summary = dedent`
		Liquidations (Pair) for ${symbol} [${data.length} points]:
		Latest: Long $${(Number(latest?.long_liquidation_usd || 0) / 1_000_000).toFixed(2)}M | Short $${(Number(latest?.short_liquidation_usd || 0) / 1_000_000).toFixed(2)}M
		Totals: Long $${(total.long / 1_000_000).toFixed(2)}M | Short $${(total.short / 1_000_000).toFixed(2)}M
	`;

	return `${summary}\n\n${JSON.stringify({ latest, totals: total, points: data }, null, 2)}`;
}
