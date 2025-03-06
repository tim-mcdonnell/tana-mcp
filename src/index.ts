/**
 * Tana MCP Server
 * Main entry point for the MCP server that connects to Tana's Input API
 */

import { TanaMcpServer } from './server/tana-mcp-server';

// Get the API token from environment variables
const apiToken = process.env.TANA_API_TOKEN;

// Check if the API token is provided
if (!apiToken) {
  console.error('Error: TANA_API_TOKEN environment variable is required');
  process.exit(1);
}

// Optional custom endpoint from environment variables
const endpoint = process.env.TANA_API_ENDPOINT;

// Create and start the MCP server
const server = new TanaMcpServer(apiToken, endpoint);

// Start the server
server.start().catch((error) => {
  console.error('Error starting Tana MCP server:', error);
  process.exit(1);
}); 