import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { env } from "./config.js";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export class CoinglassClient {
	private lastRequestTime = 0;
	private readonly client: AxiosInstance;

	constructor(
		private readonly baseUrl: string = env.COINGLASS_API_BASE_URL,
		private readonly apiKey: string = env.COINGLASS_API_KEY,
		private readonly rateLimitMs: number = env.COINGLASS_API_RATE_LIMIT,
		private readonly timeoutMs: number = 10000,
	) {
		if (!this.apiKey) {
			throw new Error(
				"COINGLASS_API_KEY is required. Set it in your environment to use Coinglass endpoints.",
			);
		}

		this.client = axios.create({
			baseURL: this.baseUrl,
			timeout: this.timeoutMs,
			headers: {
				accept: "application/json",
				"Content-Type": "application/json",
				"CG-API-KEY": this.apiKey,
			},
		});

		axiosRetry(this.client, {
			retries: 3,
			retryDelay: axiosRetry.exponentialDelay,
			retryCondition: (error) => {
				const status = error.response?.status;
				return (
					!status ||
					status >= 500 ||
					status === 429 ||
					axiosRetry.isNetworkOrIdempotentRequestError(error)
				);
			},
			shouldResetTimeout: true,
		});

		this.client.interceptors.request.use(async (cfg) => {
			await this.rateLimit();
			return cfg;
		});

		this.client.interceptors.response.use(
			(resp) => resp,
			(error) => {
				const status = error.response?.status;
				if (status === 401) {
					console.error("Unauthorized: invalid COINGLASS_API_KEY");
				} else if (status === 429) {
					console.warn("Coinglass rate limit hit; retrying/backing off...");
				}
				return Promise.reject(error);
			},
		);
	}

	private async rateLimit(): Promise<void> {
		const now = Date.now();
		const elapsed = now - this.lastRequestTime;
		if (elapsed < this.rateLimitMs) {
			await new Promise((resolve) =>
				setTimeout(resolve, this.rateLimitMs - elapsed),
			);
		}
		this.lastRequestTime = Date.now();
	}

	async get<T>(
		endpoint: string,
		params?: QueryParams,
		options?: AxiosRequestConfig,
	): Promise<T> {
		const res = await this.client.get(endpoint, { params, ...options });
		return res.data as T;
	}
}

export const coinglassClient = new CoinglassClient();
