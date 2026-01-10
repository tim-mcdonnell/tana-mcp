// ABOUTME: MCP server implementation for Tana Input API
// Provides tools, prompts, and resources for interacting with Tana

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { TanaClient } from './tana-client.js';
import type {
  TanaBooleanNode,
  TanaDateNode,
  TanaFileNode,
  TanaNode,
  TanaPlainNode,
  TanaReferenceNode,
  TanaUrlNode
} from '../types/tana-api.js';

export class TanaMcpServer {
  private readonly server: McpServer;
  private readonly tanaClient: TanaClient;

  constructor(apiToken: string, endpoint?: string, defaultTarget?: string) {
    this.tanaClient = new TanaClient({
      apiToken,
      endpoint,
      defaultTarget
    });

    this.server = new McpServer({
      name: 'Tana MCP Server',
      version: '2.0.0'
    });

    this.registerTools();
    this.registerPrompts();
    this.registerResources();
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  private registerTools(): void {
    // Create plain node
    this.server.registerTool(
      'create_plain_node',
      {
        title: 'Create Plain Node',
        description: 'Create a simple text node in Tana with optional supertags. For formatted content with **bold**, inline refs, etc., use create_formatted_node instead.',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID (use "INBOX" for inbox, or omit for default target)'),
          name: z.string().describe('The node title/name'),
          description: z.string().optional().describe('Optional description (plain text, formatting not supported here)'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: { targetNodeId?: string; name: string; description?: string; supertagIds?: string[] }) => {
        try {
          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaPlainNode = {
            name: args.name,
            description: args.description,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating plain node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create reference node
    this.server.registerTool(
      'create_reference_node',
      {
        title: 'Create Reference Node',
        description: 'Create a reference to an existing node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this reference under'),
          referenceId: z.string().describe('The ID of the node to reference')
        })
      },
      async (args: { targetNodeId?: string; referenceId: string }) => {
        try {
          const node: TanaReferenceNode = {
            dataType: 'reference',
            id: args.referenceId
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating reference node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create date node
    this.server.registerTool(
      'create_date_node',
      {
        title: 'Create Date Node',
        description: 'Create a date node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this node under'),
          date: z.string().describe('Date in ISO 8601 format (YYYY-MM-DD)'),
          description: z.string().optional().describe('Optional description'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: { targetNodeId?: string; date: string; description?: string; supertagIds?: string[] }) => {
        try {
          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaDateNode = {
            dataType: 'date',
            name: args.date,
            description: args.description,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating date node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create URL node
    this.server.registerTool(
      'create_url_node',
      {
        title: 'Create URL Node',
        description: 'Create a URL/link node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this node under'),
          url: z.string().url().describe('The URL to store'),
          description: z.string().optional().describe('Optional description of the link'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: { targetNodeId?: string; url: string; description?: string; supertagIds?: string[] }) => {
        try {
          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaUrlNode = {
            dataType: 'url',
            name: args.url,
            description: args.description,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating URL node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create checkbox/task node
    this.server.registerTool(
      'create_checkbox_node',
      {
        title: 'Create Checkbox Node',
        description: 'Create a checkbox/task node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this node under'),
          name: z.string().describe('The task/checkbox name'),
          checked: z.boolean().describe('Whether the checkbox is checked'),
          description: z.string().optional().describe('Optional description'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: { targetNodeId?: string; name: string; checked: boolean; description?: string; supertagIds?: string[] }) => {
        try {
          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaBooleanNode = {
            dataType: 'boolean',
            name: args.name,
            value: args.checked,
            description: args.description,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating checkbox node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create file node
    this.server.registerTool(
      'create_file_node',
      {
        title: 'Create File Node',
        description: 'Create a file attachment node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this node under'),
          fileData: z.string().describe('Base64 encoded file data'),
          filename: z.string().describe('Name of the file'),
          contentType: z.string().describe('MIME type of the file (e.g., application/pdf)'),
          description: z.string().optional().describe('Optional description'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: { targetNodeId?: string; fileData: string; filename: string; contentType: string; description?: string; supertagIds?: string[] }) => {
        try {
          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaFileNode = {
            dataType: 'file',
            file: args.fileData,
            filename: args.filename,
            contentType: args.contentType,
            description: args.description,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating file node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Set node name
    this.server.registerTool(
      'set_node_name',
      {
        title: 'Set Node Name',
        description: 'Update the name of an existing node in Tana. Note: This only works on plain text nodes - checkbox/boolean nodes cannot be renamed via the API.',
        inputSchema: z.object({
          nodeId: z.string().describe('The ID of the node to rename'),
          newName: z.string().describe('The new name for the node')
        })
      },
      async (args: { nodeId: string; newName: string }) => {
        try {
          const result = await this.tanaClient.setNodeName(args.nodeId, args.newName);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          // Provide helpful context for common errors
          let helpText = '';
          if (errorMsg.includes('400')) {
            helpText = ' This may be because the node is a checkbox/boolean type, which cannot be renamed via the API.';
          }
          return {
            content: [{
              type: 'text' as const,
              text: `Error setting node name: ${errorMsg}${helpText}`
            }],
            isError: true
          };
        }
      }
    );

    // Create node structure (for complex nested nodes)
    this.server.registerTool(
      'create_node_structure',
      {
        title: 'Create Node Structure',
        description: 'Create a complex node structure with nested children. Pass a JSON object conforming to the Tana API node format.',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID to add this structure under'),
          nodeJson: z.string().describe('JSON string representing the node structure. Must conform to Tana API format.')
        })
      },
      async (args: { targetNodeId?: string; nodeJson: string }) => {
        try {
          const node = JSON.parse(args.nodeJson) as TanaNode;
          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating node structure: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create supertag
    this.server.registerTool(
      'create_supertag',
      {
        title: 'Create Supertag',
        description: 'Create a new supertag definition in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().default('SCHEMA').describe('Target node ID (defaults to SCHEMA)'),
          name: z.string().describe('Name of the supertag'),
          description: z.string().optional().describe('Description of the supertag')
        })
      },
      async (args: { targetNodeId?: string; name: string; description?: string }) => {
        try {
          const node: TanaPlainNode = {
            name: args.name,
            description: args.description,
            supertags: [{ id: 'SYS_T01' }]
          };

          const result = await this.tanaClient.createNode(args.targetNodeId || 'SCHEMA', node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating supertag: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create field definition
    this.server.registerTool(
      'create_field',
      {
        title: 'Create Field',
        description: 'Create a new field definition in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().optional().default('SCHEMA').describe('Target node ID (defaults to SCHEMA)'),
          name: z.string().describe('Name of the field'),
          description: z.string().optional().describe('Description of the field')
        })
      },
      async (args: { targetNodeId?: string; name: string; description?: string }) => {
        try {
          const node: TanaPlainNode = {
            name: args.name,
            description: args.description,
            supertags: [{ id: 'SYS_T02' }]
          };

          const result = await this.tanaClient.createNode(args.targetNodeId || 'SCHEMA', node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating field: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Add field value to a node
    this.server.registerTool(
      'add_field_value',
      {
        title: 'Add Field Value',
        description: 'Add a field value to an existing node in Tana',
        inputSchema: z.object({
          targetNodeId: z.string().describe('The node ID to add the field to'),
          fieldId: z.string().describe('The field attribute ID'),
          value: z.string().describe('The value for the field (can be text or a node reference ID)')
        })
      },
      async (args: { targetNodeId: string; fieldId: string; value: string }) => {
        try {
          const fieldNode = {
            type: 'field' as const,
            attributeId: args.fieldId,
            children: [{
              name: args.value
            }]
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, fieldNode as TanaNode);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error adding field value: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // Create formatted node with rich content
    this.server.registerTool(
      'create_formatted_node',
      {
        title: 'Create Formatted Node',
        description: 'Create a node with rich formatted content including inline references and text styling. Use this when you need to link to other nodes or apply formatting.',
        inputSchema: z.object({
          targetNodeId: z.string().optional().describe('Target node ID (use "INBOX" for inbox)'),
          name: z.string().describe('The node title/name'),
          content: z.string().describe('Content with formatting. Use: **bold**, __italic__, ~~strike~~, ^^highlight^^'),
          inlineRefs: z.array(z.object({
            placeholder: z.string().describe('Text to replace in content'),
            nodeId: z.string().describe('Node ID to reference')
          })).optional().describe('Array of inline node references to insert'),
          inlineDates: z.array(z.object({
            placeholder: z.string().describe('Text to replace in content'),
            date: z.string().describe('Date in ISO format (YYYY-MM-DD)')
          })).optional().describe('Array of inline date references to insert'),
          supertagIds: z.array(z.string()).optional().describe('Array of supertag IDs to apply')
        })
      },
      async (args: {
        targetNodeId?: string;
        name: string;
        content: string;
        inlineRefs?: Array<{ placeholder: string; nodeId: string }>;
        inlineDates?: Array<{ placeholder: string; date: string }>;
        supertagIds?: string[];
      }) => {
        try {
          // Formatting goes in the NAME field, not description (per Tana API)
          let formattedName = args.content;

          // Replace placeholders with inline node references
          if (args.inlineRefs) {
            for (const ref of args.inlineRefs) {
              formattedName = formattedName.replace(
                ref.placeholder,
                `<span data-inlineref-node="${ref.nodeId}">`
              );
            }
          }

          // Replace placeholders with inline date references
          if (args.inlineDates) {
            for (const dateRef of args.inlineDates) {
              formattedName = formattedName.replace(
                dateRef.placeholder,
                `<span data-inlineref-date='{"dateTimeString":"${dateRef.date}"}'>`
              );
            }
          }

          const supertags = args.supertagIds?.map((id: string) => ({ id }));
          const node: TanaPlainNode = {
            name: formattedName,
            supertags
          };

          const result = await this.tanaClient.createNode(args.targetNodeId, node);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error creating formatted node: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );
  }

  private registerPrompts(): void {
    // Create task prompt
    this.server.registerPrompt(
      'create-task',
      {
        title: 'Create Task',
        description: 'Create a task node in Tana with optional due date and priority',
        argsSchema: {
          title: z.string().describe('Task title'),
          description: z.string().optional().describe('Task description'),
          dueDate: z.string().optional().describe('Due date in ISO format (YYYY-MM-DD)'),
          priority: z.enum(['high', 'medium', 'low']).optional().describe('Task priority'),
          tags: z.string().optional().describe('Comma-separated tags to apply')
        }
      },
      (args: { title: string; description?: string; dueDate?: string; priority?: string; tags?: string }) => {
        const parts = [`Create a task in Tana: "${args.title}"`];
        if (args.description) parts.push(`Description: ${args.description}`);
        if (args.dueDate) parts.push(`Due date: ${args.dueDate}`);
        if (args.priority) parts.push(`Priority: ${args.priority}`);
        if (args.tags) parts.push(`Tags: ${args.tags}`);

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: parts.join('\n') }
          }]
        };
      }
    );

    // Create project prompt
    this.server.registerPrompt(
      'create-project',
      {
        title: 'Create Project',
        description: 'Create a project structure in Tana with goals and milestones',
        argsSchema: {
          name: z.string().describe('Project name'),
          description: z.string().optional().describe('Project description'),
          goals: z.string().optional().describe('Comma-separated list of project goals'),
          startDate: z.string().optional().describe('Start date in ISO format'),
          endDate: z.string().optional().describe('End date in ISO format'),
          team: z.string().optional().describe('Comma-separated team member names')
        }
      },
      (args: { name: string; description?: string; goals?: string; startDate?: string; endDate?: string; team?: string }) => {
        const parts = [`Create a project in Tana: "${args.name}"`];
        if (args.description) parts.push(`Description: ${args.description}`);
        if (args.goals) {
          parts.push('Goals:');
          args.goals.split(',').map((g: string) => g.trim()).forEach((goal: string) => parts.push(`- ${goal}`));
        }
        if (args.startDate) parts.push(`Start date: ${args.startDate}`);
        if (args.endDate) parts.push(`End date: ${args.endDate}`);
        if (args.team) parts.push(`Team: ${args.team}`);

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: parts.join('\n') }
          }]
        };
      }
    );

    // Create meeting notes prompt
    this.server.registerPrompt(
      'create-meeting-notes',
      {
        title: 'Create Meeting Notes',
        description: 'Create structured meeting notes in Tana',
        argsSchema: {
          title: z.string().describe('Meeting title'),
          date: z.string().describe('Meeting date in ISO format'),
          attendees: z.string().describe('Comma-separated list of attendees'),
          agenda: z.string().optional().describe('Comma-separated meeting agenda items'),
          notes: z.string().optional().describe('Meeting notes'),
          actionItems: z.string().optional().describe('JSON array of action items with task, assignee, dueDate fields')
        }
      },
      (args: { title: string; date: string; attendees: string; agenda?: string; notes?: string; actionItems?: string }) => {
        const parts = [
          'Create meeting notes in Tana:',
          `Title: ${args.title}`,
          `Date: ${args.date}`,
          `Attendees: ${args.attendees}`
        ];

        if (args.agenda) {
          parts.push('\nAgenda:');
          args.agenda.split(',').map((a: string) => a.trim()).forEach((item: string) => parts.push(`- ${item}`));
        }

        if (args.notes) {
          parts.push(`\nNotes:\n${args.notes}`);
        }

        if (args.actionItems) {
          parts.push('\nAction Items:');
          try {
            const items = JSON.parse(args.actionItems);
            if (Array.isArray(items)) {
              items.forEach((item: { task?: string; assignee?: string; dueDate?: string }) => {
                let actionText = `- ${item.task || 'Task'}`;
                if (item.assignee) actionText += ` (assigned to: ${item.assignee})`;
                if (item.dueDate) actionText += ` [due: ${item.dueDate}]`;
                parts.push(actionText);
              });
            }
          } catch {
            parts.push(`- ${args.actionItems}`);
          }
        }

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: parts.join('\n') }
          }]
        };
      }
    );

    // Create knowledge entry prompt
    this.server.registerPrompt(
      'create-knowledge-entry',
      {
        title: 'Create Knowledge Entry',
        description: 'Create a knowledge base entry in Tana',
        argsSchema: {
          topic: z.string().describe('Topic or title'),
          category: z.string().optional().describe('Category or type'),
          content: z.string().describe('Main content'),
          sources: z.string().optional().describe('Comma-separated reference sources or links'),
          relatedTopics: z.string().optional().describe('Comma-separated related topics for linking')
        }
      },
      (args: { topic: string; category?: string; content: string; sources?: string; relatedTopics?: string }) => {
        const parts = [`Create a knowledge entry in Tana about: "${args.topic}"`];
        if (args.category) parts.push(`Category: ${args.category}`);
        parts.push(`\nContent:\n${args.content}`);

        if (args.sources) {
          parts.push('\nSources:');
          args.sources.split(',').map((s: string) => s.trim()).forEach((source: string) => parts.push(`- ${source}`));
        }

        if (args.relatedTopics) {
          parts.push(`\nRelated topics: ${args.relatedTopics}`);
        }

        return {
          messages: [{
            role: 'user' as const,
            content: { type: 'text' as const, text: parts.join('\n') }
          }]
        };
      }
    );
  }

  private registerResources(): void {
    // API documentation resource
    this.server.registerResource(
      'api-docs',
      'tana://api/documentation',
      {
        description: 'Tana Input API documentation and usage guide',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://api/documentation',
          mimeType: 'text/markdown',
          text: `# Tana Input API Documentation

## Overview
This MCP server provides access to Tana's Input API for creating and managing nodes in your Tana workspace.

## Available Tools

### Node Creation
- \`create_plain_node\` - Create basic text nodes
- \`create_reference_node\` - Link to existing nodes
- \`create_date_node\` - Create date nodes
- \`create_url_node\` - Create URL/link nodes
- \`create_checkbox_node\` - Create task/checkbox nodes
- \`create_file_node\` - Attach files (base64 encoded)
- \`create_node_structure\` - Create complex nested structures

### Schema Management
- \`create_supertag\` - Define new supertags
- \`create_field\` - Define new fields
- \`add_field_value\` - Add field values to nodes

### Utilities
- \`set_node_name\` - Rename existing nodes

## API Limits
- Maximum 100 nodes per request
- 1 request per second per token
- 5000 character payload limit
- 750k total nodes per workspace

## Getting Node IDs
To reference existing nodes, you need their Tana node IDs. You can find these:
1. In the Tana URL when viewing a node
2. From API responses when creating nodes
3. Using Tana's built-in API node`
        }]
      })
    );

    // Node types reference
    this.server.registerResource(
      'node-types',
      'tana://reference/node-types',
      {
        description: 'Reference for all Tana node types and their formats',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://reference/node-types',
          mimeType: 'text/markdown',
          text: `# Tana Node Types Reference

## Plain Node
Basic text nodes for general content.
\`\`\`json
{
  "name": "Node title",
  "description": "Content with **markdown**",
  "supertags": [{"id": "tagId"}]
}
\`\`\`

## Reference Node
Links to existing nodes.
\`\`\`json
{
  "dataType": "reference",
  "id": "existingNodeId"
}
\`\`\`

## Date Node
Date values in ISO format.
\`\`\`json
{
  "dataType": "date",
  "name": "2024-01-15"
}
\`\`\`

## URL Node
Web links.
\`\`\`json
{
  "dataType": "url",
  "name": "https://example.com"
}
\`\`\`

## Checkbox Node
Tasks with completion state.
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
Structured field values.
\`\`\`json
{
  "type": "field",
  "attributeId": "fieldId",
  "children": [{"name": "field value"}]
}
\`\`\``
        }]
      })
    );

    // Examples resource
    this.server.registerResource(
      'examples',
      'tana://examples/common-patterns',
      {
        description: 'Common usage patterns and examples',
        mimeType: 'text/markdown'
      },
      async () => ({
        contents: [{
          uri: 'tana://examples/common-patterns',
          mimeType: 'text/markdown',
          text: `# Common Tana Usage Examples

## Creating a Task with Due Date
Use \`create_node_structure\` with nested field:
\`\`\`json
{
  "dataType": "boolean",
  "name": "Complete project proposal",
  "value": false,
  "children": [
    {
      "type": "field",
      "attributeId": "SYS_A13",
      "children": [{"dataType": "date", "name": "2024-12-31"}]
    }
  ]
}
\`\`\`

## Creating a Tagged Note
Use \`create_plain_node\` with supertags:
\`\`\`
name: "Important meeting notes"
description: "Discussion about Q4 planning..."
supertagIds: ["yourMeetingTagId"]
\`\`\`

## Adding a Reference Link
Use \`create_reference_node\`:
\`\`\`
targetNodeId: "parentNodeId"
referenceId: "nodeToLinkTo"
\`\`\`

## System Supertag IDs
- \`SYS_T01\` - Supertag definition
- \`SYS_T02\` - Field definition
- \`SYS_A13\` - Due date field`
        }]
      })
    );

    // Server info resource
    this.server.registerResource(
      'server-info',
      'tana://info',
      {
        description: 'Current server status and configuration',
        mimeType: 'text/plain'
      },
      async () => ({
        contents: [{
          uri: 'tana://info',
          mimeType: 'text/plain',
          text: `Tana MCP Server v2.0.0
Status: Connected
API Endpoint: ${(this.tanaClient as unknown as { endpoint: string }).endpoint}

Registered Capabilities:
- 11 Tools for node creation and management
- 4 Prompts for common workflows
- 4 Resources for documentation

For API documentation, access the 'api-docs' resource.`
        }]
      })
    );
  }
}
