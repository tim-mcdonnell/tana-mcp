/**
 * Tana API Client
 * A client for interacting with the Tana Input API
 */

import axios from 'axios';
import {
  TanaAPIRequest,
  TanaAPIResponse,
  TanaConfig,
  TanaCreateNodesRequest,
  TanaNode,
  TanaNodeResponse,
  TanaSetNameRequest
} from '../types/tana-api';

export class TanaClient {
  private readonly apiToken: string;
  private readonly endpoint: string;

  constructor(config: TanaConfig) {
    this.apiToken = config.apiToken;
    this.endpoint = config.endpoint || 'https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2';
  }

  /**
   * Create nodes in Tana
   * @param targetNodeId Optional target node ID to add nodes under
   * @param nodes Array of nodes to create
   * @returns The created nodes
   */
  async createNodes(targetNodeId: string | undefined, nodes: TanaNode[]): Promise<TanaNodeResponse[]> {
    if (nodes.length > 100) {
      throw new Error('Maximum of 100 nodes can be created in a single request');
    }

    const request: TanaCreateNodesRequest = {
      targetNodeId,
      nodes
    };

    const response = await this.makeRequest(request);
    return response.children || [];
  }

  /**
   * Create a single node in Tana
   * @param targetNodeId Optional target node ID to add the node under
   * @param node Node to create
   * @returns The created node
   */
  async createNode(targetNodeId: string | undefined, node: TanaNode): Promise<TanaNodeResponse> {
    const nodes = await this.createNodes(targetNodeId, [node]);
    if (nodes.length === 0) {
      throw new Error('Failed to create node');
    }
    return nodes[0];
  }

  /**
   * Set the name of a node in Tana
   * @param targetNodeId ID of the node to rename
   * @param newName New name for the node
   * @returns The updated node
   */
  async setNodeName(targetNodeId: string, newName: string): Promise<TanaNodeResponse> {
    const request: TanaSetNameRequest = {
      targetNodeId,
      setName: newName
    };

    const response = await this.makeRequest(request);
    
    // Handle the different response format for setName
    if (response.children && response.children.length > 0) {
      return response.children[0];
    }
    
    // If the response doesn't match expected format, make a best guess
    return { nodeId: targetNodeId };
  }

  /**
   * Make a request to the Tana API
   * @param request The request to send
   * @returns The API response
   */
  private async makeRequest(request: TanaAPIRequest): Promise<TanaAPIResponse> {
    try {
      const response = await axios.post<TanaAPIResponse>(this.endpoint, request, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Tana API error: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }
} 