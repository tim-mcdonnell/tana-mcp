# Tana MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that connects to [Tana's Input API](https://tana.inc/docs/input-api), allowing Large Language Models (LLMs) and other MCP clients to create and manipulate data in Tana workspaces.

<a href="https://glama.ai/mcp/servers/r6v3135zsm">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/r6v3135zsm/badge" alt="Tana Server MCP server" />
</a>

## Features

This MCP server provides comprehensive access to Tana's Input API with:

### 🛠️ Tools (11 available)
- **Node Creation**: Create plain, reference, date, URL, checkbox, and file nodes
- **Field Management**: Create and manage field nodes with structured data
- **Complex Structures**: Build nested node hierarchies
- **Schema Operations**: Create supertags and field definitions
- **Node Updates**: Modify existing node names

### 💬 Prompts (4 templates)
- **Task Creation**: Structured task creation with due dates and priorities
- **Project Setup**: Complete project structures with goals and milestones
- **Meeting Notes**: Formatted meeting notes with attendees and action items
- **Knowledge Base**: Organized knowledge entries with categories and sources

### 📚 Resources (4 available)
- **API Documentation**: Complete reference for Tana Input API
- **Node Types Guide**: Detailed examples of all supported node types
- **Usage Examples**: Common patterns and best practices
- **Server Info**: Current status and configuration details

## Requirements

- Node.js 18 or higher
- A Tana workspace with API access enabled
- Tana API token (generated from Tana settings)

## Installation

### Global Installation (Recommended)

```bash
npm install -g tana-mcp
```

### Local Installation

```bash
npm install tana-mcp
```

## Configuration

### Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tana-mcp": {
      "command": "npx",
      "args": ["-y", "tana-mcp"],
      "env": {
        "TANA_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### Raycast

1. Install the MCP extension in Raycast
2. Open "Manage MCP Servers" command
3. Add a new server with this configuration:

```json
{
  "tana-mcp": {
    "command": "npx",
    "args": ["-y", "tana-mcp"],
    "env": {
      "TANA_API_TOKEN": "your-api-token-here"
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients, use:
- **Command**: `npx -y tana-mcp` (or `tana-mcp` if installed globally)
- **Environment**: `TANA_API_TOKEN=your-api-token-here`

## Getting Your Tana API Token

1. Open Tana in your browser
2. Go to Settings → API tokens
3. Create a new token with appropriate permissions
4. Copy the token and add it to your MCP client configuration

## Usage Examples

Once configured, you can interact with Tana through your MCP client:

### Creating a Simple Node
```
Create a new node titled "Project Ideas" in my Tana workspace
```

### Creating a Task
```
Create a task "Review Q4 budget" with high priority due next Friday
```

### Creating a Project Structure
```
Create a project called "Website Redesign" with milestones for design, development, and launch
```

### Using Prompts
MCP clients that support prompts can use templates like:
- `create-task` - Interactive task creation
- `create-project` - Structured project setup
- `create-meeting-notes` - Meeting documentation
- `create-knowledge-entry` - Knowledge base entries

## API Limitations

- Maximum 100 nodes per request
- Rate limit: 1 request per second per token
- Payload size: 5000 characters maximum
- Workspace limit: 750,000 nodes

## Development

### Building from Source

```bash
git clone https://github.com/tim-mcdonnell/tana-mcp.git
cd tana-mcp
npm install
npm run build
```

### Running in Development

```bash
TANA_API_TOKEN=your-token npm run dev
```

## Troubleshooting

### "Missing expected parameter key: items" (Raycast)
This error was fixed in v1.2.0. Please update to the latest version.

### Connection Issues
- Verify your API token is correct
- Check that your workspace hasn't exceeded the 750k node limit
- Ensure you're not exceeding the rate limit (1 request/second)

### Node Creation Failures
- Verify the target node ID exists (if specified)
- Check that supertag/field IDs are valid for your workspace
- Ensure payload is under 5000 characters

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/tim-mcdonnell/tana-mcp/issues) page.