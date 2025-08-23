/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";

const paramsSchema = z.object({
	symbol: z.string().min(1),
	exchange: z.string().optional(),
	timeframe: z
		.enum(["5m", "15m", "1h", "4h", "12h", "24h"])
		.default("24h")
		.optional(),
});

type Params = z.infer<typeof paramsSchema>;

export const liquidationsTool = {
	name: "COINGLASS_LIQUIDATIONS",
	description: "Get liquidation history snapshot for a futures pair",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const symbol = params.symbol.endsWith("USDT")
				? params.symbol
				: `${params.symbol.toUpperCase()}USDT`;
			const intervalMap: Record<string, string> = {
				"5m": "5m",
				"15m": "15m",
				"1h": "1h",
				"4h": "4h",
				"12h": "12h",
				"24h": "1d",
			};
			const interval = intervalMap[params.timeframe || "24h"];

			const data = await svc.getLiquidationsHistory({
				symbol,
				exchange: params.exchange,
				interval,
				limit: 1,
			});

			const entry: any = Array.isArray((data as any).data)
				? (data as any).data[0]
				: (data as any).data;
			const total = Number(entry?.totalAmount || 0);
			const longAmt = Number(entry?.longAmount || 0);
			const shortAmt = Number(entry?.shortAmount || 0);

			const summary = dedent`
      Liquidations for ${symbol} (${params.timeframe || "24h"}):
      Total: $${(total / 1_000_000).toFixed(2)}M | Long: $${(longAmt / 1_000_000).toFixed(2)}M | Short: $${(shortAmt / 1_000_000).toFixed(2)}M
    `;

			return `${summary}\n\n${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching liquidations: ${error}`;
		}
	},
};
