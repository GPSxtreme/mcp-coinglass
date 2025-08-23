# MCP-Coinglass

This project implements a Model Context Protocol (MCP) server for the CoinGlass API (v4). It lets MCP-compatible clients (AI assistants, IDE extensions, or custom apps) access futures market analytics such as Open Interest, Liquidations, Long/Short Ratio, and Funding Rates.

## Features (MCP Tools)

The server exposes the following tools that MCP clients can call:

- COINGLASS_OPEN_INTEREST: Open interest exchange list for a symbol; optional history
  - Parameters: symbol (string), exchange? (string), includeHistory? (boolean), period? ("1h" | "4h" | "12h" | "24h")
- COINGLASS_LIQUIDATIONS: Liquidation snapshot for a futures pair
  - Parameters: symbol (string), exchange? (string), timeframe? ("5m" | "15m" | "1h" | "4h" | "12h" | "24h")
- COINGLASS_LONG_SHORT_RATIO: Global account long/short ratio snapshot
  - Parameters: symbol (string), exchange? (string), period? ("1h" | "4h" | "12h" | "24h")
- COINGLASS_FUNDING_RATE: Current funding rate across exchanges
  - Parameters: symbol (string), exchange? (string)

All tools return a concise human-readable summary followed by a JSON payload for programmatic consumption.

## Prerequisites

- Node.js v20+ (CI uses Node 22)
- pnpm (https://pnpm.io/installation)

## Installation

There are a few ways to run mcp-coinglass:

1) Using pnpm dlx (recommended for most MCP client setups)

Run the published package directly without a global install. See the MCP client config example below.

2) Global installation from npm (via pnpm)

```bash
pnpm add -g mcp-coinglass
```

3) Building from source (development)

```bash
pnpm install
pnpm run build
pnpm run start
```

## Configuration (Environment Variables)

This server requires a CoinGlass API key. All CoinGlass v4 endpoints require the CG-API-KEY header. Generate your API key from your account dashboard and supply it via environment variables. References:

- Authentication docs: https://docs.coinglass.com/reference/authentication
- Account/API key dashboard: https://www.coinglass.com/account

Create a .env file (or configure env in your MCP client) with:

```bash
COINGLASS_API_KEY=your_api_key_here
```

An .env.sample file is included as a reference; copy it to .env and fill in your key.
**NOTE: All the available tools require an upgraded coinglass api plan to work**

## Running the Server with an MCP Client

MCP clients (assistants, IDE extensions) run this server as a background process. Configure your client with a server entry similar to the following.

Using pnpm dlx:

```json
{
  "mcpServers": {
    "coinglass-mcp-server": {
      "command": "pnpm",
      "args": ["dlx", "mcp-coinglass"],
      "env": {
        "COINGLASS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

If globally installed (pnpm add -g mcp-coinglass):

```json
{
  "mcpServers": {
    "coinglass-mcp-server": {
      "command": "mcp-coinglass",
      "args": [],
      "env": {
        "COINGLASS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Example Tool Invocations

MCP clients pass JSON parameters to tools. Examples:

```json
{ "tool": "COINGLASS_OPEN_INTEREST", "params": { "symbol": "BTC", "includeHistory": true, "period": "24h" } }
```

```json
{ "tool": "COINGLASS_LIQUIDATIONS", "params": { "symbol": "BTCUSDT", "timeframe": "4h" } }
```

```json
{ "tool": "COINGLASS_LONG_SHORT_RATIO", "params": { "symbol": "ETH", "period": "1h" } }
```

```json
{ "tool": "COINGLASS_FUNDING_RATE", "params": { "symbol": "SOL" } }
```

## Scripts

- pnpm run build: Compile TypeScript to dist/ and make output executable
- pnpm run start: Run the built server over stdio (for MCP)
- pnpm run lint: Lint via Biome
- pnpm run format: Format via Biome

## Endpoint References (v4)

This server calls these REST endpoints:

- Open Interest Exchange List: GET /api/futures/open-interest/exchange-list
- Open Interest History (OHLC): GET /api/futures/open-interest/history
- Liquidations History: GET /api/futures/liquidation/history
- Global Long/Short Account Ratio History: GET /api/futures/global-long-short-account-ratio/history
- Funding Rate Exchange List: GET /api/futures/funding-rate/exchange-list

Refer to the official docs for authentication and rate limits:

- https://docs.coinglass.com/reference/authentication
