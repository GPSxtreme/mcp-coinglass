import dedent from "dedent";
import { z } from "zod";
import { CoinglassService } from "../services/coinglass-service.js";
import type {
	FundingRateEntry,
	FundingRateSymbolItem,
} from "../types/exchange-list.js";

const paramsSchema = z.object({
	symbol: z.string().min(1).describe("Base asset symbol, e.g., BTC or BTCUSDT"),
	exchange: z
		.string()
		.optional()
		.describe("Optional exchange filter, e.g., Binance"),
	prettyFormat: z
		.boolean()
		.default(true)
		.optional()
		.describe(
			"When true (default), returns a human-readable summary; when false, returns raw API-shaped data.",
		),
});

type Params = z.infer<typeof paramsSchema>;

type FundingRateEntryNormalized = {
	exchange: string;
	rate: number;
	predictedRate?: number;
	nextFundingTime: number;
};

export const fundingRateTool = {
	name: "COINGLASS_FUNDING_RATE",
	description: "Get current funding rate across exchanges for a symbol",
	parameters: paramsSchema,
	execute: async (params: Params) => {
		try {
			const svc = new CoinglassService();
			const baseSymbol = params.symbol.toUpperCase();
			const list = (await svc.getFundingRateExchangeList(
				baseSymbol,
				params.exchange,
			)) as FundingRateSymbolItem[];

			if (params.prettyFormat !== false) {
				return convertResponseToPretty(baseSymbol, list);
			}

			// prettyFormat === false => return raw response
			return `${JSON.stringify({ raw: list }, null, 2)}`;
		} catch (error) {
			return `Error fetching funding rate: ${error}`;
		}
	},
};

function convertResponseToPretty(
	baseSymbol: string,
	list: FundingRateSymbolItem[],
): string {
	const symbolEntry = list.find((s) => s.symbol === baseSymbol) || list[0];
	const entries: FundingRateEntry[] = [
		...(symbolEntry?.usdtOrUsdMarginList ?? []),
		...(symbolEntry?.tokenMarginList ?? []),
	];
	const exchanges: FundingRateEntryNormalized[] = entries.map((e) => ({
		exchange: e.exchange || "Unknown",
		rate: Number(e.fundingRate ?? 0),
		predictedRate:
			e.predictedFundingRate == null
				? undefined
				: Number(e.predictedFundingRate),
		nextFundingTime: Number(e.nextFundingTime ?? 0),
	}));

	const nonNaN = exchanges.map((e) => (Number.isNaN(e.rate) ? 0 : e.rate));
	const avg = nonNaN.length
		? nonNaN.reduce((s, v) => s + v, 0) / nonNaN.length
		: 0;
	const next = exchanges.find((e) => e.nextFundingTime)?.nextFundingTime || 0;

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
}
