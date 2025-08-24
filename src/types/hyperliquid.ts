export interface HyperliquidWhaleAlertItem {
	user: string;
	symbol: string;
	position_size: number | string;
	entry_price: number | string;
	liq_price: number | string;
	position_value_usd: number | string;
	position_action: number | string; // 1: open, 2: close
	create_time: number | string;
}

export interface HyperliquidWhalePositionItem {
	user: string;
	symbol: string;
	position_size: number | string;
	entry_price: number | string;
	mark_price: number | string;
	liq_price: number | string;
	leverage: number | string;
	margin_balance: number | string;
	position_value_usd: number | string;
	unrealized_pnl: number | string;
	funding_fee: number | string;
	margin_mode: string;
	create_time: number | string;
	update_time: number | string;
}
