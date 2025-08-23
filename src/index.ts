#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { fundingRateTool } from "./tools/funding-rate.js";
import { liquidationsTool } from "./tools/liquidations.js";
import { longShortRatioTool } from "./tools/long-short-ratio.js";
import { openInterestTool } from "./tools/open-interest.js";

async function main() {
	console.log("Initializing Coinglass MCP Server...");

	const server = new FastMCP({
		name: "Coinglass MCP Server",
		version: "0.0.1",
	});

	server.addTool(openInterestTool);
	server.addTool(liquidationsTool);
	server.addTool(longShortRatioTool);
	server.addTool(fundingRateTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ Coinglass MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log(
			"   Tools: COINGLASS_OPEN_INTEREST, COINGLASS_LIQUIDATIONS, COINGLASS_LONG_SHORT_RATIO, COINGLASS_FUNDING_RATE",
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
