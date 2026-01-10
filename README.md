# Tana MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that connects to [Tana's Input API](https://tana.inc/docs/input-api), enabling AI assistants to create and manipulate data in your Tana workspace.

<a href="https://glama.ai/mcp/servers/r6v3135zsm">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/r6v3135zsm/badge" alt="Tana Server MCP server" />
</a>

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Your Tana API Token](#getting-your-tana-api-token)
- [Installation](#installation)
  - [Raycast](#raycast)
  - [Claude Code (CLI)](#claude-code-cli)
  - [Claude Desktop](#claude-desktop)
  - [Other MCP Clients](#other-mcp-clients)
- [Configuration Options](#configuration-options)
- [Usage](#usage)
  - [Available Tools](#available-tools)
  - [Example Prompts](#example-prompts)
  - [Text Formatting](#text-formatting)
- [API Limitations](#api-limitations)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### Tools (12 available)

| Tool | Description |
|------|-------------|
| `create_plain_node` | Create simple text nodes with optional supertags |
| `create_formatted_node` | Create nodes with rich formatting and inline references |
| `create_reference_node` | Create references to existing nodes |
| `create_date_node` | Create date nodes (supports various ISO 8601 formats) |
| `create_url_node` | Create URL/link nodes |
| `create_checkbox_node` | Create checkbox/task nodes |
| `create_file_node` | Create file attachment nodes (base64 encoded) |
| `create_node_structure` | Create complex nested node hierarchies |
| `create_supertag` | Define new supertags in your schema |
| `create_field` | Define new fields in your schema |
| `add_field_value` | Add field values to existing nodes |
| `set_node_name` | Rename existing nodes (plain nodes only) |

### Prompts (4 templates)

- **create-task** - Structured task creation with due dates and priorities
- **create-project** - Project structures with goals and milestones
- **create-meeting-notes** - Meeting documentation with attendees and action items
- **create-knowledge-entry** - Knowledge base entries with categories and sources

### Resources (4 available)

- **api-docs** - Complete Tana Input API reference
- **node-types** - Detailed examples of all supported node types
- **examples** - Common usage patterns and best practices
- **server-info** - Current server status and configuration

## Prerequisites

- A [Tana](https://tana.inc) workspace with API access enabled
- Tana API token (see [Getting Your Tana API Token](#getting-your-tana-api-token))
- One of the following MCP clients:
  - [Raycast](https://raycast.com) with AI features
  - [Claude Code](https://claude.ai/code) CLI
  - [Claude Desktop](https://claude.ai/download)
  - Any other MCP-compatible client

## Getting Your Tana API Token

1. Open [Tana](https://tana.inc) in your browser
2. Click on the **Settings** icon (gear) in the bottom left
3. Navigate to **API tokens**
4. Click **Create new token**
5. Give it a descriptive name (e.g., "MCP Server")
6. Copy the token immediately - it won't be shown again

## Installation

### Raycast

Raycast integrates MCP servers directly into its AI features. Once configured, use `@tana-mcp` in any Raycast AI interaction.

#### Step 1: Install the MCP Extension

1. Open Raycast
2. Search for "Store" and open the Raycast Store
3. Search for "Model Context Protocol"
4. Install the [MCP extension](https://www.raycast.com/EvanZhouDev/mcp)

#### Step 2: Add the Tana MCP Server

1. Open Raycast and search for **"Install Server"** (from the MCP extension)
2. Fill in the form:

| Field | Value |
|-------|-------|
| Name | `Tana` |
| Type | `stdio` |
| Command | `npx` |
| Arguments | `-y tana-mcp` |

3. Add environment variables:
   - `TANA_API_TOKEN`: Your Tana API token
   - `TANA_DEFAULT_TARGET`: `INBOX` (optional - see [Configuration Options](#configuration-options))

**Alternative:** Copy this JSON before opening "Install Server" - Raycast will auto-populate the form:

```json
{
  "name": "Tana",
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "tana-mcp"],
  "env": {
    "TANA_API_TOKEN": "your-api-token-here",
    "TANA_DEFAULT_TARGET": "INBOX"
  }
}
```

#### Step 3: Use in Raycast AI

Once installed, mention the server in any Raycast AI interaction:

- **Quick AI**: Type your query and mention `@Tana`
- **AI Chat**: Start a chat and use `@Tana` to invoke tools
- **AI Commands**: Create custom commands that use Tana tools

Example: *"@Tana Create a task called 'Review quarterly report' with high priority"*

For more details, see the [Raycast MCP documentation](https://manual.raycast.com/model-context-protocol).

---

### Claude Code (CLI)

Add Tana MCP as a user-scoped server available in all your Claude Code sessions.

```bash
claude mcp add -s user \
  -e TANA_API_TOKEN=your-api-token-here \
  -e TANA_DEFAULT_TARGET=INBOX \
  tana-mcp \
  npx -y tana-mcp
```

Or for project-scoped (current directory only):

```bash
claude mcp add \
  -e TANA_API_TOKEN=your-api-token-here \
  tana-mcp \
  npx -y tana-mcp
```

Verify it's installed:

```bash
claude mcp list
```

---

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tana-mcp": {
      "command": "npx",
      "args": ["-y", "tana-mcp"],
      "env": {
        "TANA_API_TOKEN": "your-api-token-here",
        "TANA_DEFAULT_TARGET": "INBOX"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

---

### Other MCP Clients

For any MCP-compatible client, configure with:

| Setting | Value |
|---------|-------|
| Command | `npx` |
| Arguments | `-y tana-mcp` |
| Environment | `TANA_API_TOKEN=your-token` |

Or if installed globally (`npm install -g tana-mcp`):

| Setting | Value |
|---------|-------|
| Command | `tana-mcp` |
| Environment | `TANA_API_TOKEN=your-token` |

## Configuration Options

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TANA_API_TOKEN` | Yes | - | Your Tana API token |
| `TANA_DEFAULT_TARGET` | No | Library root | Where to place nodes when no target specified. Use `INBOX` for inbox, or any node ID |
| `TANA_API_ENDPOINT` | No | Tana's default | Custom API endpoint (advanced use only) |

### Target Options

- **Omit `TANA_DEFAULT_TARGET`**: Nodes appear in Library root
- **`INBOX`**: Nodes go to your Tana Inbox for later processing
- **Any node ID**: Nodes created under that specific node

## Usage

### Available Tools

#### Basic Node Creation

```
Create a node called "Meeting Notes - January 9th"
```

#### Tasks with Checkboxes

```
Create a task "Review PR #123" that's not yet completed
```

#### Rich Formatted Content

```
Create a formatted node with **bold text** and a reference to node ID abc123
```

#### Nested Structures

```
Create a project structure with:
- Project: Website Redesign
  - Phase 1: Research
  - Phase 2: Design
  - Phase 3: Development
```

#### Schema Operations

```
Create a new supertag called "Book" for tracking my reading list
```

### Example Prompts

Here are natural language prompts that work well:

| What you want | Example prompt |
|---------------|----------------|
| Quick capture | "Add 'Call dentist' to my Tana inbox" |
| Task with details | "Create a high-priority task 'Finish report' due Friday" |
| Meeting notes | "Create meeting notes for my 1:1 with Sarah, we discussed Q1 goals" |
| Project setup | "Set up a new project called 'App Launch' with planning, development, and release phases" |
| Knowledge entry | "Add a note about TypeScript generics with examples" |
| Link a URL | "Save this article: https://example.com/interesting-post" |

### Text Formatting

The `create_formatted_node` tool supports rich text formatting in node names:

| Format | Syntax | Result |
|--------|--------|--------|
| Bold | `**text**` | **text** |
| Italic | `__text__` | *text* |
| Strikethrough | `~~text~~` | ~~text~~ |
| Highlight | `^^text^^` | highlighted |

You can also include:
- **Inline node references**: Link to other nodes by ID
- **Inline dates**: Clickable date links

Example:
```
Create a formatted node: "Discussed **important** changes with [PERSON] on [DATE]"
with PERSON referencing node xyz123 and DATE as 2024-01-15
```

## API Limitations

These are Tana Input API limitations, not server limitations:

| Limit | Value |
|-------|-------|
| Nodes per request | 100 maximum |
| Rate limit | 1 request/second per token |
| Payload size | 5,000 characters |
| Workspace nodes | 750,000 maximum |

**Not supported by Tana's API:**
- Reading/querying existing nodes (write-only API)
- Targeting "Today" or relative date nodes
- Updating checkbox/boolean nodes
- Non-HTTP/HTTPS links

## Development

### Building from Source

```bash
git clone https://github.com/tim-mcdonnell/tana-mcp.git
cd tana-mcp
bun install      # or: npm install
bun run build    # or: npm run build
```

### Running Locally

```bash
TANA_API_TOKEN=your-token bun run dev
```

### Testing with Claude Code

Point Claude Code to your local build:

```bash
claude mcp add -s user \
  -e TANA_API_TOKEN=your-token \
  tana-mcp-dev \
  bun /path/to/tana-mcp/dist/index.js
```

## Troubleshooting

### "Missing expected parameter key: items"

This error occurred in versions before 2.0.0. Update to the latest version:

```bash
npm install -g tana-mcp@latest
```

### Server not connecting

1. **Verify your token**: Make sure `TANA_API_TOKEN` is set correctly
2. **Check the command**: Ensure `npx` is available in your PATH
3. **Restart the client**: Some clients require restart after config changes
4. **Check logs**: Look for error messages in your MCP client's logs

### Nodes appearing in wrong location

- Set `TANA_DEFAULT_TARGET=INBOX` to use your inbox
- Or specify `targetNodeId` in individual tool calls

### set_node_name returning 400 error

This happens when trying to rename checkbox/boolean nodes. The Tana API only supports renaming plain text nodes.

### Rate limiting errors

The Tana API limits requests to 1 per second. If you're hitting rate limits, slow down your requests or batch operations together.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/tim-mcdonnell/tana-mcp/issues)
- **Tana API Docs**: [tana.inc/docs/input-api](https://tana.inc/docs/input-api)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

**Sources:**
- [Raycast MCP Documentation](https://manual.raycast.com/model-context-protocol)
- [Raycast MCP Extension](https://www.raycast.com/EvanZhouDev/mcp)
- [Tana Input API](https://tana.inc/docs/input-api)
