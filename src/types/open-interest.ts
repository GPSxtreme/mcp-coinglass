export interface OpenInterestExchangeItem {
	exchange: string;
	symbol: string;
	open_interest_usd: number | string;
	open_interest_quantity: number | string;
	open_interest_by_stable_coin_margin?: number | string;
	open_interest_quantity_by_coin_margin?: number | string;
	open_interest_quantity_by_stable_coin_margin?: number | string;
	open_interest_change_percent_5m?: number | string;
	open_interest_change_percent_15m?: number | string;
	open_interest_change_percent_30m?: number | string;
	open_interest_change_percent_1h?: number | string;
	open_interest_change_percent_4h?: number | string;
	open_interest_change_percent_24h?: number | string;
}
