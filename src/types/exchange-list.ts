export interface FundingRateEntry {
	exchange: string;
	fundingRate: number | string;
	predictedFundingRate?: number | string;
	nextFundingTime?: number | string;
}

export interface FundingRateSymbolItem {
	symbol: string;
	usdtOrUsdMarginList?: FundingRateEntry[];
	tokenMarginList?: FundingRateEntry[];
}
