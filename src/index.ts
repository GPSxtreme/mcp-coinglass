#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { fundingRateTool } from "./tools/funding-rate.js";
import { hyperliquidWhaleAlertTool } from "./tools/hyperliquid-whale-alert.js";
import { hyperliquidWhalePositionTool } from "./tools/hyperliquid-whale-position.js";
import { liquidationsCoinTool } from "./tools/liquidations-coin.js";
import { liquidationsPairTool } from "./tools/liquidations-pair.js";
import { longShortRatioTool } from "./tools/long-short-ratio.js";
import { openInterestTool } from "./tools/open-interest.js";

async function main() {
	console.log("Initializing Coinglass MCP Server...");

	const server = new FastMCP({
		name: "Coinglass MCP Server",
		version: "0.0.1",
	});

	server.addTool(openInterestTool);
	server.addTool(liquidationsPairTool);
	server.addTool(liquidationsCoinTool);
	server.addTool(longShortRatioTool);
	server.addTool(fundingRateTool);
	server.addTool(hyperliquidWhaleAlertTool);
	server.addTool(hyperliquidWhalePositionTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ Coinglass MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log(
			"   Tools: COINGLASS_OPEN_INTEREST, COINGLASS_LIQUIDATIONS_PAIR, COINGLASS_LIQUIDATIONS_COIN, COINGLASS_LONG_SHORT_RATIO, COINGLASS_FUNDING_RATE, COINGLASS_HYPERLIQUID_WHALE_ALERT, COINGLASS_HYPERLIQUID_WHALE_POSITION",
		);
	} catch (error) {
		console.error("❌ Failed to start Coinglass MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the Coinglass MCP Server:",
		error,
	);
	process.exit(1);
});
