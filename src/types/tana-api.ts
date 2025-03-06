/**
 * Tana API Types
 * Based on documentation from https://tana.inc/docs/input-api
 */

// Basic node types
export type DataType = 'plain' | 'reference' | 'date' | 'url' | 'boolean' | 'file';

export interface TanaSupertag {
  id: string;
  fields?: Record<string, string>;
}

export interface TanaBaseNode {
  name?: string;
  description?: string;
  supertags?: TanaSupertag[];
  children?: TanaNode[];
}

export interface TanaPlainNode extends TanaBaseNode {
  dataType?: 'plain';
}

export interface TanaReferenceNode {
  dataType: 'reference';
  id: string;
}

export interface TanaDateNode extends TanaBaseNode {
  dataType: 'date';
  name: string; // ISO 8601 format
}

export interface TanaUrlNode extends TanaBaseNode {
  dataType: 'url';
  name: string; // URL string
}

export interface TanaBooleanNode extends TanaBaseNode {
  dataType: 'boolean';
  name: string;
  value: boolean;
}

export interface TanaFileNode extends TanaBaseNode {
  dataType: 'file';
  file: string; // base64 encoded file data
  filename: string;
  contentType: string; // MIME type
}

export interface TanaFieldNode {
  type: 'field';
  attributeId: string;
  children?: TanaNode[];
}

export type TanaNode = 
  | TanaPlainNode 
  | TanaReferenceNode 
  | TanaDateNode 
  | TanaUrlNode 
  | TanaBooleanNode 
  | TanaFileNode
  | TanaFieldNode;

// API Request Types
export interface TanaCreateNodesRequest {
  targetNodeId?: string;
  nodes: TanaNode[];
}

export interface TanaSetNameRequest {
  targetNodeId: string;
  setName: string;
}

export type TanaAPIRequest = TanaCreateNodesRequest | TanaSetNameRequest;

// API Response Types
export interface TanaNodeResponse {
  nodeId: string;
  name?: string;
  description?: string;
  children?: TanaNodeResponse[];
}

export interface TanaAPIResponse {
  children?: TanaNodeResponse[];
}

// Configuration
export interface TanaConfig {
  apiToken: string;
  endpoint?: string;
} 