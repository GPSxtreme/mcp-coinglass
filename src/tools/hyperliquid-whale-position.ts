import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type { HyperliquidWhalePositionItem } from "../types/hyperliquid.js";

const paramsSchema = z.object({
	prettyFormat: z
		.boolean()
		.default(true)
		.optional()
		.describe(
			"When true (default), returns a human-readable summary; when false, returns raw API-shaped data.",
		),
});

type Params = z.infer<typeof paramsSchema>;

export const hyperliquidWhalePositionTool = {
	name: "COINGLASS_HYPERLIQUID_WHALE_POSITION",
	description: "Get Hyperliquid whale positions (value over $1M)",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const data =
				(await svc.getHyperliquidWhalePosition()) as HyperliquidWhalePositionItem[];

			if (params.prettyFormat !== false) {
				return convertPositionToPretty(data);
			}

			return `${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching Hyperliquid whale positions: ${error}`;
		}
	},
};

function convertPositionToPretty(data: HyperliquidWhalePositionItem[]): string {
	const count = data.length;
	const top = data
		.slice()
		.sort(
			(a, b) =>
				Number(b.position_value_usd || 0) - Number(a.position_value_usd || 0),
		)
		.slice(0, 5)
		.map((d) => ({
			user: d.user,
			symbol: d.symbol,
			positionSize: Number(d.position_size || 0),
			positionValueUsd: Number(d.position_value_usd || 0),
			leverage: Number(d.leverage || 0),
			unrealizedPnl: Number(d.unrealized_pnl || 0),
			marginMode: d.margin_mode,
			updateTime: Number(d.update_time || 0),
		}));

	const summary = dedent`
		Hyperliquid Whale Positions: ${count} positions (top 5 by value)
	`;

	return `${summary}\n${JSON.stringify({ top, positions: data }, null, 2)}`;
}
