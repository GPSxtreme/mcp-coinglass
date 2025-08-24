# MCP-Coinglass

This project implements a Model Context Protocol (MCP) server for the CoinGlass API (v4). It lets MCP-compatible clients (AI assistants, IDE extensions, or custom apps) access futures market analytics such as Open Interest, Liquidations, Long/Short Ratio, and Funding Rates.

## Features (MCP Tools)

The server exposes the following tools that MCP clients can call:

- COINGLASS_OPEN_INTEREST: Open interest exchange list for a symbol; optional history
  - Parameters: symbol (string), exchange? (string), includeHistory? (boolean), period? ("1h" | "4h" | "12h" | "24h")
  
- COINGLASS_LIQUIDATIONS_PAIR: Historical pair liquidations (v4 /api/futures/liquidation/history)
  - Parameters: exchange (string), symbol (string), interval? ("1m"|"3m"|"5m"|"15m"|"30m"|"1h"|"4h"|"6h"|"8h"|"12h"|"1d"|"1w"), limit?, start_time?, end_time?, prettyFormat? (default: true)
- COINGLASS_LIQUIDATIONS_COIN: Aggregated coin liquidations (v4 /api/futures/liquidation/aggregated-history)
  - Parameters: exchange_list (string), symbol (string), interval? (same as above), limit?, start_time?, end_time?, prettyFormat? (default: true)
- COINGLASS_LONG_SHORT_RATIO: Global account long/short ratio snapshot
  - Parameters: symbol (string), exchange? (string), period? ("1h" | "4h" | "12h" | "24h"), prettyFormat? (boolean, default: true)
- COINGLASS_FUNDING_RATE: Current funding rate across exchanges
  - Parameters: symbol (string), exchange? (string), prettyFormat? (boolean, default: true)
 - COINGLASS_HYPERLIQUID_WHALE_ALERT: Real-time Hyperliquid whale alerts (>$1M)
  - Parameters: prettyFormat? (boolean, default: true)
 - COINGLASS_HYPERLIQUID_WHALE_POSITION: Real-time Hyperliquid whale positions (>$1M)
  - Parameters: prettyFormat? (boolean, default: true)

Tool call responses always return a success code even in case of api errors. In case of error tool response includes the raw api response.

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

4) For testing and development purposes use mcp inspector

```bash
# in the project root run,
pnpm run build
npx @modelcontextprotocol/inspector node dist/index.js
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
{ "tool": "COINGLASS_LIQUIDATIONS_PAIR", "params": { "exchange": "Binance", "symbol": "BTCUSDT", "interval": "4h" } }
```

```json
{ "tool": "COINGLASS_LIQUIDATIONS_COIN", "params": { "exchange_list": "Binance,OKX,Bybit", "symbol": "BTC", "interval": "1d" } }
```

```json
{ "tool": "COINGLASS_LONG_SHORT_RATIO", "params": { "symbol": "ETH", "period": "1h" } }
```

```json
{ "tool": "COINGLASS_FUNDING_RATE", "params": { "symbol": "SOL" } }
```

```json
{ "tool": "COINGLASS_HYPERLIQUID_WHALE_ALERT", "params": {} }
```

```json
{ "tool": "COINGLASS_HYPERLIQUID_WHALE_POSITION", "params": {} }
```

### Default Human-Readable Output Examples (prettyFormat=true)

These are the default formatted outputs. Set `prettyFormat` to `false` to receive raw API-shaped responses.

#### Funding Rate

```text
Funding Rate for BTCUSDT:
Average: 0.0100% | Next Funding: 2024-08-06T08:00:00.000Z
Exchanges: 12

{
  "averageRate": 0.0001,
  "nextFundingTime": 1722960000000,
  "exchanges": [
    { "exchange": "Binance", "rate": -0.0000335, "predictedRate": -0.00002, "nextFundingTime": 1722960000000 }
    // ...
  ]
}
```

#### Open Interest

```text
Open Interest for BTCUSDT:
Total OI (All): $123456789
24h Change: 2.34%

{
  "exchangeList": [ /* ... */ ],
  "history": { /* optional when includeHistory=true */ }
}
```

#### Liquidations (Pair)

```text
Liquidations (Pair) for BTCUSDT [48 points]:
Latest: Long $1.23M | Short $2.34M
Totals: Long $56.78M | Short $67.89M

{
  "latest": { /* latest data point */ },
  "totals": { "long": 56780000, "short": 67890000 },
  "points": [ /* ... */ ]
}
```

#### Liquidations (Coin Aggregated)

```text
Liquidations (Coin Aggregated) for BTC [48 points]:
Latest: Long $1.23M | Short $2.34M
Totals: Long $56.78M | Short $67.89M

{
  "latest": { /* latest data point */ },
  "totals": { "long": 56780000, "short": 67890000 },
  "points": [ /* ... */ ]
}
```

#### Global Long/Short Account Ratio

```text
Long/Short Ratio for BTCUSDT:
Long: 73.24% | Short: 26.76% | Ratio: 2.74

{
  "latest": { /* latest data point */ },
  "points": [ /* ... */ ]
}
```

#### Hyperliquid Whale Alert

```text
Hyperliquid Whale Alerts: 8 events
Top 5 by position value:

{
  "top": [
    { "user": "0xabc...", "symbol": "BTC", "positionValueUsd": 2936421.48, "positionAction": 2, "createTime": 1745219477000 }
    // ...
  ],
  "events": [ /* ... */ ]
}
```

#### Hyperliquid Whale Position

```text
Hyperliquid Whale Positions: 6 positions (top 5 by value)

{
  "top": [
    { "user": "0xdef...", "symbol": "ETH", "positionSize": -44727.13, "positionValueUsd": 73589542.55, "leverage": 25, "unrealizedPnl": 27033236.42, "marginMode": "cross", "updateTime": 1745219966000 }
    // ...
  ],
  "positions": [ /* ... */ ]
}
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
