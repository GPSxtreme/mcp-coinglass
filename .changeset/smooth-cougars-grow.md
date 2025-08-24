---
"mcp-coinglass": minor
---

- Add prettyFormat param (default true) to all tools with human-readable output and raw mode.
- Introduce shared types under src/types and move CoinglassEnvelope to src/types/common.ts.
- Funding Rate: typed response, pretty formatting helper, and improved summary.
- Open Interest: typed service, pretty formatting helper, simplified symbol handling, optional history.
- Long/Short Ratio: typed points, pretty formatting helper, prettyFormat param.
- Liquidations: split into COINGLASS_LIQUIDATIONS_PAIR and COINGLASS_LIQUIDATIONS_COIN; add services, types, and pretty helpers; remove legacy COINGLASS_LIQUIDATIONS tool.
- Hyperliquid: add COINGLASS_HYPERLIQUID_WHALE_ALERT and COINGLASS_HYPERLIQUID_WHALE_POSITION tools with services, types, and pretty helpers.
- Update README with parameters, examples, and default human-readable outputs for all tools.
- Register new tools in index and clean startup log; minor formatting/lint fixes.
