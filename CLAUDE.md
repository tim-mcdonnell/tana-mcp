# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run build` - Compile TypeScript to JavaScript in `dist/` directory
- `npm run dev` - Run development server with ts-node
- `npm start` - Start the compiled server from `dist/index.js`
- `npm run prepublishOnly` - Build before publishing to npm

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides LLMs access to Tana's Input API. The architecture has three main layers:

### Core Components

- **Entry Point**: `src/index.ts` - Validates environment variables and starts the server
- **MCP Server**: `src/server/tana-mcp-server.ts` - Implements MCP protocol and registers tools
- **API Client**: `src/server/tana-client.ts` - Handles HTTP requests to Tana's Input API
- **Type Definitions**: `src/types/tana-api.ts` - TypeScript interfaces for Tana API

### Tool Registration Pattern

The server registers 12 MCP tools that map to Tana API operations:
- Node creation tools (plain, reference, date, url, checkbox, file)
- Structure creation tools (field nodes, complex structures)
- Schema tools (supertags, fields)
- Utility tools (set node name)

Each tool follows the pattern:
1. Zod schema validation for inputs
2. Transform inputs to Tana API format
3. Call TanaClient method
4. Return JSON response

### Environment Variables

- `TANA_API_TOKEN` (required) - Tana workspace API token
- `TANA_API_ENDPOINT` (optional) - Custom API endpoint URL

### API Integration

Uses Tana's Input API v2 endpoint with:
- Bearer token authentication
- JSON request/response format
- Maximum 100 nodes per request
- Support for all Tana node types and operations

The client abstracts the HTTP layer and provides strongly-typed methods for the MCP server to use.