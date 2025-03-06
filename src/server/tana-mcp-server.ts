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

    // Create the MCP server
    this.server = new McpServer({
      name: 'Tana MCP Server',
      version: '1.0.0',
      description: 'MCP server for interacting with Tana Input API'
    });

    // Register tools
    this.registerTools();

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

    console.log('Tana MCP server started');
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
          ]
        };
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
          ]
        };
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
          ]
        };
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
          ]
        };
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
          ]
        };
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
          ]
        };
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
          ]
        };
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
        const result = await this.tanaClient.setNodeName(nodeId, newName);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
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
        // Cast to TanaNode to satisfy the type system
        const result = await this.tanaClient.createNode(targetNodeId, node as any);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );
  }

  /**
   * Register resources for interacting with Tana
   */
  private registerResources(): void {
    // Currently, Tana doesn't have a read API, so we can't provide resources
    // This could be implemented in the future when Tana adds read capabilities
  }
} 