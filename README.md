# Tana MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that connects to [Tana's Input API](https://tana.inc/docs/input-api), allowing Large Language Models (LLMs) and other MCP clients to create and manipulate data in Tana workspaces.

## Features

This MCP server fully implements all capabilities of the Tana Input API:

### Node Creation
- Create plain text nodes with optional descriptions
- Create reference nodes to link to existing nodes
- Create date nodes with ISO 8601 formatted dates
- Create URL nodes with hyperlinks
- Create checkbox (boolean) nodes with true/false states
- Create file attachment nodes with uploaded content
- Apply supertags to nodes (single or multiple)
- Create nodes with field values

### Node Structure Manipulation
- Create complex node hierarchies with child nodes
- Add field values to nodes
- Apply multiple supertags to a single node
- Create nested field structures

### Node Modification
- Update node names

## Prerequisites

- Node.js 18 or higher
- A Tana API token (generated from Tana Settings > API Tokens)
- Tana paid subscription that includes the Input API feature

## Installation

### Option 1: Install from npm (Recommended)

The easiest way to install and use the Tana MCP server:

```bash
# Install globally
npm install -g tana-mcp

# Run the server
tana-mcp
```

Or run directly with npx without installing:

```bash
# Run directly with npx
npx tana-mcp
```

### Option 2: Standard Installation from GitHub

If you prefer to clone the repository:

1. Clone this repository:
   ```
   git clone https://github.com/tim-mcdonnell/tana-mcp.git
   cd tana-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Configuration

1. Create a `.env` file in the project root (or copy from `.env.example`):
   ```
   TANA_API_TOKEN=your-tana-api-token-here
   # TANA_API_ENDPOINT=optional-custom-endpoint
   ```

2. Set your Tana API token as an environment variable:
   ```
   export TANA_API_TOKEN=your-tana-api-token
   ```

> **Note**: You can also pass the token directly when running the server:  
> `TANA_API_TOKEN=your-token tana-mcp` or `TANA_API_TOKEN=your-token npx tana-mcp`

## Usage

### Starting the Server

There are several ways to start the server:

```bash
# If installed globally
tana-mcp

# If using npx
npx tana-mcp

# From a cloned repository
npm start

# For development with auto-reload
npm run dev
```

### Integration with LLMs

The server uses the Model Context Protocol, making it compatible with any MCP-enabled client or LLM. See the `examples/example-usage.js` file for code examples of how to use each tool.

### Claude Desktop Configuration

To use this MCP server with Claude Desktop:

1. Install and set up the Tana MCP server as described above
2. Edit your Claude config file located at:
   - macOS: `~/Library/Application Support/Claude/config.json`
   - Windows: `%APPDATA%\Claude\config.json`
   - Linux: `~/.config/Claude/config.json`

3. Add the following configuration to your Claude Desktop config file:

#### Option 1: Using npm package (Recommended)

```json
{
  "mcpServers": {
    "tana-mcp": {
      "command": "npx",
      "args": [
        "-y", 
        "@tim-mcdonnell/tana-mcp"
        ],
      "env": {
        "TANA_API_TOKEN": "your-tana-api-token-here"
      }
    }
  }
}
```

#### Option 2: Using local installation

```json
{
  "mcpServers": {
    "tana-mcp": {
      "command": "node",
      "args": ["<PATH_TO_TANA_MCP>/dist/index.js"],
      "env": {
        "TANA_API_TOKEN": "your-tana-api-token-here"
      }
    }
  }
}
```

#### Alternative Format (Array-based config)

If your Claude Desktop uses the array format for MCP servers:

```json
"mcp_servers": [
  {
    "name": "Tana MCP Server",
    "type": "subprocess",
    "command": "npx",
    "args": ["-y", "tana-mcp"],
    "env": {
      "TANA_API_TOKEN": "your-tana-api-token-here"
    },
    "auto_start": true
  }
]
```

4. For Option 2: Replace `<PATH_TO_TANA_MCP>` with the absolute path to your tana-mcp directory
5. Ensure `TANA_API_TOKEN` is set to your actual Tana API token
6. Save the config file and restart Claude Desktop

Now Claude will automatically start the Tana MCP server when launched and will have access to all the Tana tools.

#### Example Prompts for Claude

Once configured, you can ask Claude to interact with Tana using natural language:

- "Create a new node in Tana with the title 'Meeting notes'"
- "Add a task with checkbox to my Tana workspace"
- "Create a project node with a deadline field set to next Friday"
- "Create a reference to my existing 'Work' node in Tana"

## MCP Tool Documentation

The server provides the following MCP tools:

### create_plain_node

Creates a plain text node in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under (use "INBOX", "SCHEMA", or a specific nodeID)
- `name`: The text content of the node
- `description` (optional): Additional description for the node
- `supertags` (optional): Array of supertags to apply to the node

**Example:**
```javascript
{
  targetNodeId: "INBOX",
  name: "My plain node",
  description: "This is a description", 
  supertags: [
    { 
      id: "supertag-node-id",
      fields: {
        "field-id-1": "field value 1"
      }
    }
  ]
}
```

### create_reference_node

Creates a reference node (pointer to another node) in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under
- `referenceId`: The ID of the node to reference

**Example:**
```javascript
{
  targetNodeId: "parent-node-id",
  referenceId: "node-to-reference-id"
}
```

### create_date_node

Creates a date node in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under
- `date`: The date in ISO 8601 format (e.g., "2023-12-01", "2023-12-01 08:00:00", "2023-W12", "2023-05")
- `description` (optional): Additional description for the node
- `supertags` (optional): Array of supertags to apply to the node

**Example:**
```javascript
{
  targetNodeId: "parent-node-id",
  date: "2023-12-01 08:00:00",
  description: "Important meeting"
}
```

### create_url_node

Creates a URL node in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under
- `url`: The URL string
- `description` (optional): Additional description for the node
- `supertags` (optional): Array of supertags to apply to the node

**Example:**
```javascript
{
  url: "https://tana.inc",
  description: "Tana website"
}
```

### create_checkbox_node

Creates a checkbox (boolean) node in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under
- `name`: The text content of the node
- `checked`: Boolean value for the checkbox state
- `description` (optional): Additional description for the node
- `supertags` (optional): Array of supertags to apply to the node

**Example:**
```javascript
{
  name: "Complete task",
  checked: false,
  description: "Task needs to be done"
}
```

### create_file_node

Creates a file attachment node in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this node under
- `fileData`: Base64 encoded file data
- `filename`: Name of the file
- `contentType`: MIME type of the file
- `description` (optional): Additional description for the node
- `supertags` (optional): Array of supertags to apply to the node

**Example:**
```javascript
{
  targetNodeId: "parent-node-id",
  fileData: "base64encodeddata...",
  filename: "document.pdf",
  contentType: "application/pdf",
  description: "Important document"
}
```

### create_field_node

Creates a field node in Tana (a field with attribute ID and optional child values).

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this field to
- `attributeId`: The ID of the field attribute/definition in Tana
- `children` (optional): Array of child nodes to add as values for this field

**Example:**
```javascript
{
  targetNodeId: "parent-node-id",
  attributeId: "field-definition-id",
  children: [
    {
      name: "Field value as text"
    }
  ]
}
```

### set_node_name

Updates the name of an existing node in Tana.

**Parameters:**
- `nodeId`: The ID of the node to rename
- `newName`: The new name for the node

**Example:**
```javascript
{
  nodeId: "node-to-update-id",
  newName: "Updated node name"
}
```

### create_node_structure

Creates a complex node structure in Tana.

**Parameters:**
- `targetNodeId` (optional): The ID of the parent node to add this structure under
- `node`: Object describing the node structure to create

**Example:**
```javascript
{
  targetNodeId: "parent-node-id",
  node: {
    name: "Parent node",
    description: "This is a parent node with children",
    supertags: [{ id: "supertag-id" }],
    children: [
      {
        name: "Child node 1"
      },
      {
        type: "field",
        attributeId: "field-id",
        children: [
          {
            dataType: "date",
            name: "2023-12-25"
          }
        ]
      }
    ]
  }
}
```

## Tana API Limitations

The Tana Input API has the following limitations which apply to this MCP server:

- **Create/Update Only**: The API currently only supports creating and updating data, not reading. Therefore, this MCP server doesn't provide any Resource capabilities yet.
- **Rate Limiting**: One call per second per token
- **Node Limit**: Maximum of 100 nodes created per call
- **Payload Size**: Limited to 5000 characters
- **Workspace Size**: Will not sync on workspaces with more than 750k nodes

## Future Enhancements

- Read capabilities (when Tana expands their API)
- Caching for improved performance
- Support for more complex query capabilities

## License

MIT