export interface PairLiquidationPoint {
	time: number;
	long_liquidation_usd: number | string;
	short_liquidation_usd: number | string;
}

export interface CoinAggregatedLiquidationPoint {
	time: number;
	aggregated_long_liquidation_usd: number | string;
	aggregated_short_liquidation_usd: number | string;
}
