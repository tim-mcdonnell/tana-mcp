/**
 * Example of how to use the Tana MCP server with an LLM client
 * 
 * This demonstrates how an LLM like Claude might interact with the Tana API via MCP
 */

// This is pseudocode - actual implementation will depend on your MCP client library

// 1. Connect to the Tana MCP server
const tanaServer = connectToMcpServer({
  name: 'Tana MCP Server',
  transport: 'stdio',  // or other transport options
});

// 2. Get available tools from the server
const tools = await tanaServer.getTools();
console.log('Available tools:', tools.map(tool => tool.name));

// 3. Create a simple plain node
const createResult = await tanaServer.callTool('create_plain_node', {
  name: 'My first node from MCP',
  description: 'Created via Model Context Protocol',
});
console.log('Created node:', createResult);

// 4. Get the node ID from the response
const nodeId = JSON.parse(createResult.content[0].text).nodeId;

// 5. Update the node name
const updateResult = await tanaServer.callTool('set_node_name', {
  nodeId,
  newName: 'Updated node name',
});
console.log('Updated node:', updateResult);

// 6. Create a more complex structure with a date node as a child
const complexResult = await tanaServer.callTool('create_node_structure', {
  node: {
    name: 'Parent node',
    description: 'This is a parent node with children',
    children: [
      {
        dataType: 'date',
        name: '2023-12-25',
        description: 'Christmas Day',
      },
      {
        name: 'Regular child node',
      },
      {
        dataType: 'boolean',
        name: 'Task to complete',
        value: false,
      }
    ]
  }
});
console.log('Created complex structure:', complexResult);

// 7. Create a node with supertags
const supertagResult = await tanaServer.callTool('create_plain_node', {
  name: 'Node with supertags',
  supertags: [
    {
      id: 'your-supertag-id-here',
      fields: {
        'field-id-1': 'field value 1',
        'field-id-2': 'field value 2',
      }
    }
  ]
});
console.log('Created node with supertags:', supertagResult);

// 8. Create a field node
const fieldNodeResult = await tanaServer.callTool('create_field_node', {
  targetNodeId: nodeId, // Using the ID from a previously created node
  attributeId: 'field-attribute-id', // ID of the field definition in Tana
  children: [
    {
      name: 'Field value as a child node',
    }
  ]
});
console.log('Created field node:', fieldNodeResult);

// 9. Create a node with multiple supertags
const multiSupertagResult = await tanaServer.callTool('create_plain_node', {
  name: 'Node with multiple supertags',
  supertags: [
    {
      id: 'project-supertag-id',
      fields: {
        'priority': 'high',
        'status': 'in-progress'
      }
    },
    {
      id: 'task-supertag-id',
      fields: {
        'assigned-to': 'user-id-123'
      }
    }
  ]
});
console.log('Created node with multiple supertags:', multiSupertagResult);

// 10. Create a plain node with a field as a child using create_node_structure
const plainWithFieldResult = await tanaServer.callTool('create_node_structure', {
  node: {
    name: 'Plain node with field child',
    children: [
      {
        type: 'field',
        attributeId: 'due-date-field-id',
        children: [
          {
            dataType: 'date',
            name: '2024-01-15'
          }
        ]
      },
      {
        type: 'field',
        attributeId: 'assignee-field-id',
        children: [
          {
            name: 'John Doe'
          }
        ]
      }
    ]
  }
});
console.log('Created plain node with fields:', plainWithFieldResult);

/**
 * In a real LLM conversation, this would look something like:
 * 
 * User: "Create a new project in Tana called 'Website Redesign' with a deadline of December 15, 2023"
 * 
 * LLM: [internally calls the MCP tools]
 * 
 * const result = await tanaServer.callTool('create_node_structure', {
 *   node: {
 *     name: 'Website Redesign',
 *     supertags: [{ id: 'project-tag-id' }],
 *     children: [
 *       {
 *         type: 'field',
 *         attributeId: 'deadline-field-id',
 *         children: [
 *           {
 *             dataType: 'date',
 *             name: '2023-12-15'
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * });
 * 
 * LLM: "I've created a new project in Tana called 'Website Redesign' with a 
 *       deadline set to December 15, 2023."
 */ 