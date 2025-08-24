export interface CoinglassEnvelope<T> {
	code: string;
	msg?: string;
	data: T;
}
