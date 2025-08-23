/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";

const paramsSchema = z.object({
	symbol: z.string().min(1),
	exchange: z.string().optional(),
	period: z.enum(["1h", "4h", "12h", "24h"]).default("24h").optional(),
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
			const symbol = params.symbol.endsWith("USDT")
				? params.symbol
				: `${params.symbol.toUpperCase()}USDT`;
			const intervalMap: Record<string, string> = {
				"1h": "1h",
				"4h": "4h",
				"12h": "12h",
				"24h": "1d",
			};
			const interval = intervalMap[params.period || "24h"];

			const data = await svc.getLongShortAccountRatioHistory({
				symbol,
				exchange: params.exchange,
				interval,
				limit: 1,
			});
			const entry: any = Array.isArray((data as any).data)
				? (data as any).data[0]
				: (data as any).data;

			const longRate = Number(entry?.longRate || 0);
			const shortRate = Number(entry?.shortRate || 0);

			const summary = dedent`
				Long/Short Ratio for ${symbol}:
				Long: ${(longRate * 100).toFixed(1)}% | Short: ${(shortRate * 100).toFixed(1)}%
			`;

			return `${summary}\n\n${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching long/short ratio: ${error}`;
		}
	},
};
