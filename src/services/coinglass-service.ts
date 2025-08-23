import { z } from "zod";
import { coinglassClient } from "../lib/coinglass-client.js";

const oiExchangeItemSchema = z.object({
	exchange: z.string(),
	symbol: z.string(),
	open_interest_usd: z
		.number()
		.or(z.string())
		.transform((v) => Number(v)),
	open_interest_quantity: z
		.number()
		.or(z.string())
		.transform((v) => Number(v)),
	open_interest_change_percent_24h: z
		.number()
		.or(z.string())
		.transform((v) => Number(v))
		.optional(),
});

const coinglassEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		code: z.string(),
		msg: z.string().optional(),
		data: dataSchema,
	});

export class CoinglassService {
	async getOpenInterestExchangeList(symbol: string) {
		const res = await coinglassClient.get(
			"/api/futures/open-interest/exchange-list",
			{ symbol },
		);
		const parsed = coinglassEnvelopeSchema(
			z.array(oiExchangeItemSchema),
		).safeParse(res);
		if (!parsed.success || parsed.data.code !== "0") {
			throw new Error(
				`Failed to fetch OI exchange list:
				Raw response:
				 ${JSON.stringify(res, null, 2)}`,
			);
		}
		return parsed.data.data;
	}

	async getOpenInterestHistory(params: {
		symbol: string;
		exchange?: string;
		interval: string;
		limit?: number;
	}) {
		const res = await coinglassClient.get(
			"/api/futures/open-interest/history",
			{
				symbol: params.symbol,
				exchange: params.exchange,
				interval: params.interval,
				limit: params.limit ?? 100,
			},
		);
		return res as unknown as Record<string, unknown>;
	}

	async getLiquidationsHistory(params: {
		symbol: string;
		exchange?: string;
		interval: string;
		limit?: number;
	}) {
		const res = await coinglassClient.get("/api/futures/liquidation/history", {
			symbol: params.symbol,
			exchange: params.exchange,
			interval: params.interval,
			limit: params.limit ?? 100,
		});
		return res as unknown as Record<string, unknown>;
	}

	async getLongShortAccountRatioHistory(params: {
		symbol: string;
		exchange?: string;
		interval: string;
		limit?: number;
	}) {
		const res = await coinglassClient.get(
			"/api/futures/global-long-short-account-ratio/history",
			{
				symbol: params.symbol,
				exchange: params.exchange,
				interval: params.interval,
				limit: params.limit ?? 100,
			},
		);
		return res as unknown as Record<string, unknown>;
	}

	async getFundingRateExchangeList(symbol: string, exchange?: string) {
		const res = await coinglassClient.get(
			"/api/futures/funding-rate/exchange-list",
			{ symbol, exchange },
		);
		const parsed = coinglassEnvelopeSchema(
			z.array(z.record(z.any())),
		).safeParse(res);
		if (!parsed.success || parsed.data.code !== "0") {
			throw new Error(
				`Failed to fetch Funding Rate exchange list:
				 Raw response:
				 ${JSON.stringify(res, null, 2)}
				`,
			);
		}
		return parsed.data.data as Array<Record<string, unknown>>;
	}
}
