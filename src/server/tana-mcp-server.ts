/**
 * Tana MCP Server
 * An MCP server that connects to the Tana Input API
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { TanaClient } from './tana-client';
import {
  TanaBooleanNode,
  TanaDateNode,
  TanaFileNode,
  TanaPlainNode,
  TanaReferenceNode,
  TanaSupertag,
  TanaUrlNode
} from '../types/tana-api';

// Define Zod schemas for validating inputs
const SupertagSchema = z.object({
  id: z.string(),
  fields: z.record(z.string()).optional()
});

// We need a recursive type for NodeSchema to handle field nodes and other nested structures
const NodeSchema = z.lazy(() => 
  z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    supertags: z.array(SupertagSchema).optional(),
    children: z.array(z.any()).optional(), // Will be validated by implementation 
    // Fields for specific node types
    dataType: z.enum(['plain', 'reference', 'date', 'url', 'boolean', 'file']).optional(),
    id: z.string().optional(), // For reference nodes
    value: z.boolean().optional(), // For boolean nodes
    file: z.string().optional(), // For file nodes (base64)
    filename: z.string().optional(), // For file nodes
    contentType: z.string().optional(), // For file nodes
    // Field node properties
    type: z.literal('field').optional(),
    attributeId: z.string().optional()
  })
);

export class TanaMcpServer {
  private readonly server: McpServer;
  private readonly tanaClient: TanaClient;

  constructor(apiToken: string, endpoint?: string) {
    // Create the Tana client
    this.tanaClient = new TanaClient({
      apiToken,
      endpoint
    });

    // Create the MCP server with proper capabilities
    this.server = new McpServer({
      name: 'Tana MCP Server',
      version: '1.2.0'
    });

    // Register tools
    this.registerTools();

    // Register prompts
    this.registerPrompts();

    // Register resources
    this.registerResources();
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    // Create the transport
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    await this.server.connect(transport);
    
    // Server is ready - no logging to stderr to avoid protocol interference
  }

  /**
   * Register tools for interacting with Tana
   */
  private registerTools(): void {
    // Create a plain node tool
    this.server.tool(
      'create_plain_node',
      {
        targetNodeId: z.string().optional(),
        name: z.string(),
        description: z.string().optional(),
        supertags: z.array(SupertagSchema).optional()
      },
      async ({ targetNodeId, name, description, supertags }) => {
        try {
          const node: TanaPlainNode = {
            name,
            description,
            supertags
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating plain node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a reference node tool
    this.server.tool(
      'create_reference_node',
      {
        targetNodeId: z.string().optional(),
        referenceId: z.string()
      },
      async ({ targetNodeId, referenceId }) => {
        try {
          const node: TanaReferenceNode = {
            dataType: 'reference',
            id: referenceId
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating reference node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a date node tool
    this.server.tool(
      'create_date_node',
      {
        targetNodeId: z.string().optional(),
        date: z.string(),
        description: z.string().optional(),
        supertags: z.array(SupertagSchema).optional()
      },
      async ({ targetNodeId, date, description, supertags }) => {
        try {
          const node: TanaDateNode = {
            dataType: 'date',
            name: date,
            description,
            supertags
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating date node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a URL node tool
    this.server.tool(
      'create_url_node',
      {
        targetNodeId: z.string().optional(),
        url: z.string().url(),
        description: z.string().optional(),
        supertags: z.array(SupertagSchema).optional()
      },
      async ({ targetNodeId, url, description, supertags }) => {
        try {
          const node: TanaUrlNode = {
            dataType: 'url',
            name: url,
            description,
            supertags
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating URL node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a checkbox node tool
    this.server.tool(
      'create_checkbox_node',
      {
        targetNodeId: z.string().optional(),
        name: z.string(),
        checked: z.boolean(),
        description: z.string().optional(),
        supertags: z.array(SupertagSchema).optional()
      },
      async ({ targetNodeId, name, checked, description, supertags }) => {
        try {
          const node: TanaBooleanNode = {
            dataType: 'boolean',
            name,
            value: checked,
            description,
            supertags
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating checkbox node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a file node tool
    this.server.tool(
      'create_file_node',
      {
        targetNodeId: z.string().optional(),
        fileData: z.string(), // base64 encoded file data
        filename: z.string(),
        contentType: z.string(),
        description: z.string().optional(),
        supertags: z.array(SupertagSchema).optional()
      },
      async ({ targetNodeId, fileData, filename, contentType, description, supertags }) => {
        try {
          const node: TanaFileNode = {
            dataType: 'file',
            file: fileData,
            filename,
            contentType,
            description,
            supertags
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating file node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a field node tool
    this.server.tool(
      'create_field_node',
      {
        targetNodeId: z.string().optional(),
        attributeId: z.string(),
        children: z.array(NodeSchema).optional()
      },
      async ({ targetNodeId, attributeId, children }) => {
        try {
          // Properly type the field node according to TanaFieldNode interface
          const fieldNode = {
            type: 'field' as const, // Use 'as const' to ensure type is "field"
            attributeId,
            children
          };

          // Cast to TanaNode to satisfy the type system
          const result = await this.tanaClient.createNode(targetNodeId, fieldNode as any);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating field node: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Set node name tool
    this.server.tool(
      'set_node_name',
      {
        nodeId: z.string(),
        newName: z.string()
      },
      async ({ nodeId, newName }) => {
        try {
          const result = await this.tanaClient.setNodeName(nodeId, newName);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error setting node name: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a complex node structure tool
    this.server.tool(
      'create_node_structure',
      {
        targetNodeId: z.string().optional(),
        node: NodeSchema
      },
      async ({ targetNodeId, node }) => {
        try {
          // Cast to TanaNode to satisfy the type system
          const result = await this.tanaClient.createNode(targetNodeId, node as any);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating node structure: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a supertag tool
    this.server.tool(
      'create_supertag',
      {
        targetNodeId: z.string().optional().default('SCHEMA'),
        name: z.string(),
        description: z.string().optional()
      },
      async ({ targetNodeId, name, description }) => {
        try {
          const node: TanaPlainNode = {
            name,
            description,
            supertags: [{ id: 'SYS_T01' }]
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating supertag: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Create a field tool
    this.server.tool(
      'create_field',
      {
        targetNodeId: z.string().optional().default('SCHEMA'),
        name: z.string(),
        description: z.string().optional()
      },
      async ({ targetNodeId, name, description }) => {
        try {
          const node: TanaPlainNode = {
            name,
            description,
            supertags: [{ id: 'SYS_T02' }]
          };

          const result = await this.tanaClient.createNode(targetNodeId, node);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error creating field: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }

  /**
   * Register prompts for common Tana operations
   */
  private registerPrompts(): void {
    // Prompt for creating a task
    this.server.prompt(
      'create-task',
      'Create a task node in Tana with optional due date and tags',
      {
        title: z.string().describe('Task title'),
        description: z.string().optional().describe('Task description'),
        dueDate: z.string().optional().describe('Due date in ISO format (YYYY-MM-DD)'),
        priority: z.enum(['high', 'medium', 'low']).optional().describe('Task priority'),
        tags: z.array(z.string()).optional().describe('Tags to apply to the task')
      },
      ({ title, description, dueDate, priority, tags }) => {
        const parts = [`Create a task in Tana: "${title}"`];
        
        if (description) parts.push(`Description: ${description}`);
        if (dueDate) parts.push(`Due date: ${dueDate}`);
        if (priority) parts.push(`Priority: ${priority}`);
        if (tags && tags.length > 0) parts.push(`Tags: ${tags.join(', ')}`);
        
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: parts.join('\n')
            }
          }]
        };
      }
    );

    // Prompt for creating a project
    this.server.prompt(
      'create-project',
      'Create a project structure in Tana with goals and milestones',
      {
        name: z.string().describe('Project name'),
        description: z.string().optional().describe('Project description'),
        goals: z.array(z.string()).optional().describe('Project goals'),
        startDate: z.string().optional().describe('Start date in ISO format'),
        endDate: z.string().optional().describe('End date in ISO format'),
        team: z.array(z.string()).optional().describe('Team member names')
      },
      ({ name, description, goals, startDate, endDate, team }) => {
        const parts = [`Create a project in Tana: "${name}"`];
        
        if (description) parts.push(`Description: ${description}`);
        if (goals && goals.length > 0) {
          parts.push('Goals:');
          goals.forEach(goal => parts.push(`- ${goal}`));
        }
        if (startDate) parts.push(`Start date: ${startDate}`);
        if (endDate) parts.push(`End date: ${endDate}`);
        if (team && team.length > 0) parts.push(`Team: ${team.join(', ')}`);
        
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: parts.join('\n')
            }
          }]
        };
      }
    );

    // Prompt for creating meeting notes
    this.server.prompt(
      'create-meeting-notes',
      'Create structured meeting notes in Tana',
      {
        title: z.string().describe('Meeting title'),
        date: z.string().describe('Meeting date in ISO format'),
        attendees: z.array(z.string()).describe('List of attendees'),
        agenda: z.array(z.string()).optional().describe('Meeting agenda items'),
        notes: z.string().optional().describe('Meeting notes'),
        actionItems: z.array(z.object({
          task: z.string(),
          assignee: z.string().optional(),
          dueDate: z.string().optional()
        })).optional().describe('Action items from the meeting')
      },
      ({ title, date, attendees, agenda, notes, actionItems }) => {
        const parts = [
          `Create meeting notes in Tana:`,
          `Title: ${title}`,
          `Date: ${date}`,
          `Attendees: ${attendees.join(', ')}`
        ];
        
        if (agenda && agenda.length > 0) {
          parts.push('\nAgenda:');
          agenda.forEach(item => parts.push(`- ${item}`));
        }
        
        if (notes) {
          parts.push(`\nNotes:\n${notes}`);
        }
        
        if (actionItems && actionItems.length > 0) {
          parts.push('\nAction Items:');
          actionItems.forEach(item => {
            let actionText = `- ${item.task}`;
            if (item.assignee) actionText += ` (assigned to: ${item.assignee})`;
            if (item.dueDate) actionText += ` [due: ${item.dueDate}]`;
            parts.push(actionText);
          });
        }
        
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: parts.join('\n')
            }
          }]
        };
      }
    );

    // Prompt for knowledge base entry
    this.server.prompt(
      'create-knowledge-entry',
      'Create a knowledge base entry in Tana',
      {
        topic: z.string().describe('Topic or title'),
        category: z.string().optional().describe('Category or type'),
        content: z.string().describe('Main content'),
        sources: z.array(z.string()).optional().describe('Reference sources or links'),
        relatedTopics: z.array(z.string()).optional().describe('Related topics for linking')
      },
      ({ topic, category, content, sources, relatedTopics }) => {
        const parts = [`Create a knowledge entry in Tana about: "${topic}"`];
        
        if (category) parts.push(`Category: ${category}`);
        parts.push(`\nContent:\n${content}`);
        
        if (sources && sources.length > 0) {
          parts.push('\nSources:');
          sources.forEach(source => parts.push(`- ${source}`));
        }
        
        if (relatedTopics && relatedTopics.length > 0) {
          parts.push(`\nRelated topics: ${relatedTopics.join(', ')}`);
        }
        
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: parts.join('\n')
            }
          }]
        };
      }
    );
  }

  /**
   * Register resources for interacting with Tana
   */
  private registerResources(): void {
    // API documentation resource
    this.server.resource(
      'api-docs',
      'tana://api/documentation',
      {
        name: 'Tana API Documentation',
        description: 'Overview of Tana Input API capabilities and usage',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://api/documentation',
          mimeType: 'text/markdown',
          text: `# Tana Input API Documentation

## Overview
This MCP server provides access to Tana's Input API, allowing you to create and manipulate nodes in your Tana workspace.

## Available Node Types
- **Plain nodes**: Basic text nodes with optional formatting
- **Reference nodes**: Links to existing nodes by ID
- **Date nodes**: Nodes representing dates
- **URL nodes**: Web links with metadata
- **Checkbox nodes**: Boolean/task nodes
- **File nodes**: Attachments with base64 encoded data
- **Field nodes**: Structured data fields

## Tools Available

### Basic Node Creation
- \`create_plain_node\`: Create a simple text node
- \`create_reference_node\`: Create a reference to another node
- \`create_date_node\`: Create a date node
- \`create_url_node\`: Create a URL node
- \`create_checkbox_node\`: Create a checkbox/task node
- \`create_file_node\`: Create a file attachment node

### Advanced Features
- \`create_field_node\`: Create structured field nodes
- \`create_node_structure\`: Create complex nested node structures
- \`set_node_name\`: Update the name of an existing node

### Schema Management
- \`create_supertag\`: Create new supertags (node types)
- \`create_field\`: Create new field definitions

## API Limits
- Maximum 100 nodes per request
- 1 request per second per token
- Payload limit: 5000 characters
- Workspace limit: 750k nodes`
        }]
      })
    );

    // Node types reference
    this.server.resource(
      'node-types',
      'tana://reference/node-types',
      {
        name: 'Tana Node Types Reference',
        description: 'Detailed information about all supported node types',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://reference/node-types',
          mimeType: 'text/markdown',
          text: `# Tana Node Types Reference

## Plain Node
The most basic node type, used for text content.
\`\`\`json
{
  "name": "Node title",
  "description": "Node content with **formatting**",
  "supertags": [{"id": "tagId"}],
  "children": []
}
\`\`\`

## Reference Node
Links to an existing node.
\`\`\`json
{
  "dataType": "reference",
  "id": "targetNodeId"
}
\`\`\`

## Date Node
Represents a date value.
\`\`\`json
{
  "dataType": "date",
  "name": "2024-01-01",
  "description": "Optional description"
}
\`\`\`

## URL Node
Stores web links.
\`\`\`json
{
  "dataType": "url",
  "name": "https://example.com",
  "description": "Link description"
}
\`\`\`

## Checkbox Node
Boolean/task nodes.
\`\`\`json
{
  "dataType": "boolean",
  "name": "Task name",
  "value": false
}
\`\`\`

## File Node
File attachments.
\`\`\`json
{
  "dataType": "file",
  "file": "base64EncodedData",
  "filename": "document.pdf",
  "contentType": "application/pdf"
}
\`\`\`

## Field Node
Structured data fields.
\`\`\`json
{
  "type": "field",
  "attributeId": "fieldId",
  "children": [/* nested nodes */]
}
\`\`\``
        }]
      })
    );

    // Examples resource
    this.server.resource(
      'examples',
      'tana://examples/common-patterns',
      {
        name: 'Common Usage Examples',
        description: 'Example patterns for common Tana operations',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://examples/common-patterns',
          mimeType: 'text/markdown',
          text: `# Common Tana Usage Examples

## Creating a Task with Due Date
\`\`\`javascript
// Use create_checkbox_node with a child date node
{
  "name": "Complete project proposal",
  "checked": false,
  "children": [
    {
      "type": "field",
      "attributeId": "SYS_A13", // Due date field
      "children": [{
        "dataType": "date",
        "name": "2024-12-31"
      }]
    }
  ]
}
\`\`\`

## Creating a Project Structure
\`\`\`javascript
// Use create_node_structure for complex hierarchies
{
  "name": "Q1 2024 Product Launch",
  "supertags": [{"id": "projectTagId"}],
  "children": [
    {
      "name": "Milestones",
      "children": [
        {"name": "Design Complete", "dataType": "date", "name": "2024-01-15"},
        {"name": "Development Done", "dataType": "date", "name": "2024-02-28"}
      ]
    },
    {
      "name": "Tasks",
      "children": [
        {"dataType": "boolean", "name": "Create mockups", "value": false},
        {"dataType": "boolean", "name": "Write documentation", "value": false}
      ]
    }
  ]
}
\`\`\`

## Adding Multiple Tags
\`\`\`javascript
{
  "name": "Important Note",
  "supertags": [
    {"id": "tag1Id"},
    {"id": "tag2Id", "fields": {"priority": "high"}}
  ]
}
\`\`\``
        }]
      })
    );

    // Server info resource
    this.server.resource(
      'server-info',
      'tana://info',
      {
        name: 'Server Information',
        description: 'Current server status and configuration',
        mimeType: 'text/plain'
      },
      async () => ({
        contents: [{
          uri: 'tana://info',
          mimeType: 'text/plain',
          text: `Tana MCP Server v${this.server.version || '1.2.0'}
Status: Connected
API Endpoint: ${this.tanaClient['endpoint']}

Capabilities:
- Tools: ${Object.keys(this.server['_tools'] || {}).length} registered
- Prompts: ${Object.keys(this.server['_prompts'] || {}).length} registered  
- Resources: ${Object.keys(this.server['_resources'] || {}).length} available

For detailed API documentation, see the 'api-docs' resource.
For examples, see the 'examples' resource.`
        }]
      })
    );
  }

} 