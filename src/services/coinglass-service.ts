import { coinglassClient } from "../lib/coinglass-client.js";
import type { CoinglassEnvelope } from "../types/common.js";
import type { FundingRateSymbolItem } from "../types/exchange-list.js";
import type {
	HyperliquidWhaleAlertItem,
	HyperliquidWhalePositionItem,
} from "../types/hyperliquid.js";
import type {
	CoinAggregatedLiquidationPoint,
	PairLiquidationPoint,
} from "../types/liquidations.js";
import type { GlobalAccountRatioPoint } from "../types/long-short-ratio.js";
import type { OpenInterestExchangeItem } from "../types/open-interest.js";

export class CoinglassService {
	async getOpenInterestExchangeList(
		symbol: string,
	): Promise<OpenInterestExchangeItem[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<OpenInterestExchangeItem[]>
		>("/api/futures/open-interest/exchange-list", { symbol });
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch OI exchange list:\nRaw response:\n ${JSON.stringify(res, null, 2)}`,
			);
		}
		return res.data;
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
	}): Promise<GlobalAccountRatioPoint[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<GlobalAccountRatioPoint[]>
		>("/api/futures/global-long-short-account-ratio/history", {
			symbol: params.symbol,
			exchange: params.exchange as string | undefined,
			interval: params.interval,
			limit: params.limit ?? 100,
		});
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch global account ratio history:\n Raw response:\n ${JSON.stringify(
					res,
					null,
					2,
				)}`,
			);
		}
		return res.data;
	}

	async getFundingRateExchangeList(
		symbol: string,
		exchange?: string,
	): Promise<FundingRateSymbolItem[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<FundingRateSymbolItem[]>
		>("/api/futures/funding-rate/exchange-list", { symbol, exchange });
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch Funding Rate exchange list:\n Raw response:\n ${JSON.stringify(res, null, 2)}`,
			);
		}
		return res.data;
	}

	async getPairLiquidationsHistory(params: {
		exchange: string;
		symbol: string;
		interval: string;
		limit?: number;
		start_time?: number;
		end_time?: number;
	}): Promise<PairLiquidationPoint[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<PairLiquidationPoint[]>
		>("/api/futures/liquidation/history", params);
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch pair liquidation history:\n Raw response:\n ${JSON.stringify(
					res,
					null,
					2,
				)}`,
			);
		}
		return res.data;
	}

	async getCoinAggregatedLiquidationsHistory(params: {
		exchange_list: string;
		symbol: string;
		interval: string;
		limit?: number;
		start_time?: number;
		end_time?: number;
	}): Promise<CoinAggregatedLiquidationPoint[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<CoinAggregatedLiquidationPoint[]>
		>("/api/futures/liquidation/aggregated-history", params);
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch coin aggregated liquidation history:\n Raw response:\n ${JSON.stringify(
					res,
					null,
					2,
				)}`,
			);
		}
		return res.data;
	}

	async getHyperliquidWhaleAlert(): Promise<HyperliquidWhaleAlertItem[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<HyperliquidWhaleAlertItem[]>
		>("/api/hyperliquid/whale-alert");
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch Hyperliquid whale alerts:\n Raw response:\n ${JSON.stringify(
					res,
					null,
					2,
				)}`,
			);
		}
		return res.data;
	}

	async getHyperliquidWhalePosition(): Promise<HyperliquidWhalePositionItem[]> {
		const res = await coinglassClient.get<
			CoinglassEnvelope<HyperliquidWhalePositionItem[]>
		>("/api/hyperliquid/whale-position");
		if (res.code !== "0") {
			throw new Error(
				`Failed to fetch Hyperliquid whale positions:\n Raw response:\n ${JSON.stringify(
					res,
					null,
					2,
				)}`,
			);
		}
		return res.data;
	}
}
