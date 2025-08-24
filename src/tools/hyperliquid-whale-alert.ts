import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type { HyperliquidWhaleAlertItem } from "../types/hyperliquid.js";

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

export const hyperliquidWhaleAlertTool = {
	name: "COINGLASS_HYPERLIQUID_WHALE_ALERT",
	description: "Get real-time Hyperliquid whale alerts (positions over $1M)",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const data =
				(await svc.getHyperliquidWhaleAlert()) as HyperliquidWhaleAlertItem[];

			if (params.prettyFormat !== false) {
				return convertAlertToPretty(data);
			}

			return `${JSON.stringify({ raw: data }, null, 2)}`;
		} catch (error) {
			return `Error fetching Hyperliquid whale alerts: ${error}`;
		}
	},
};

function convertAlertToPretty(data: HyperliquidWhaleAlertItem[]): string {
	const count = data.length;
	const top = data.slice(0, 5).map((d) => ({
		user: d.user,
		symbol: d.symbol,
		positionValueUsd: Number(d.position_value_usd || 0),
		positionAction: Number(d.position_action || 0),
		createTime: Number(d.create_time || 0),
	}));

	const summary = dedent`
		Hyperliquid Whale Alerts: ${count} events
		Top 5 by position value:
	`;

	return `${summary}\n${JSON.stringify({ top, events: data }, null, 2)}`;
}
