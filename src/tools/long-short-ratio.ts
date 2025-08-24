/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type { GlobalAccountRatioPoint } from "../types/long-short-ratio.js";

const paramsSchema = z.object({
	symbol: z.string().min(1).describe("Trading pair, e.g., BTCUSDT or BTC"),
	exchange: z.string().optional().describe("Futures exchange, e.g., Binance"),
	period: z
		.enum(["1h", "4h", "12h", "24h"])
		.default("24h")
		.optional()
		.describe("Aggregation period: 1h, 4h, 12h, 24h (maps to 1h/4h/12h/1d)"),
	prettyFormat: z
		.boolean()
		.default(true)
		.optional()
		.describe(
			"When true (default), returns a human-readable summary; when false, returns raw API-shaped data.",
		),
});

type Params = z.infer<typeof paramsSchema>;

export const longShortRatioTool = {
	name: "COINGLASS_LONG_SHORT_RATIO",
	description:
		"Get global account long/short ratio history snapshot for a symbol",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const symbol = params.symbol.toUpperCase();
			const intervalMap: Record<string, string> = {
				"1h": "1h",
				"4h": "4h",
				"12h": "12h",
				"24h": "1d",
			};
			const interval = intervalMap[params.period || "24h"];

			const points = (await svc.getLongShortAccountRatioHistory({
				symbol,
				exchange: params.exchange,
				interval,
				limit: 100,
			})) as GlobalAccountRatioPoint[];

			if (params.prettyFormat !== false) {
				return convertLsrToPretty(symbol, points);
			}

			return `${JSON.stringify({ raw: points }, null, 2)}`;
		} catch (error) {
			return `Error fetching long/short ratio: ${error}`;
		}
	},
};

function convertLsrToPretty(
	symbol: string,
	points: GlobalAccountRatioPoint[],
): string {
	const latest = points[points.length - 1];
	const longPercent = Number(latest?.global_account_long_percent ?? 0);
	const shortPercent = Number(latest?.global_account_short_percent ?? 0);
	const ratio = Number(latest?.global_account_long_short_ratio ?? 0);

	const summary = dedent`
				Long/Short Ratio for ${symbol}:
				Long: ${longPercent.toFixed(2)}% | Short: ${shortPercent.toFixed(2)}% | Ratio: ${ratio.toFixed(2)}
			`;

	return `${summary}\n\n${JSON.stringify({ latest, points }, null, 2)}`;
}
