#!/usr/bin/env node
/**
 * OPENART_MCP_BRIDGE: stdin JSON {namespace, tool, arguments} → stdout tool result JSON.
 * Uses Streamable HTTP to OpenArt hosted MCP (OAuth session must exist in Cursor; headless may fail).
 */
import fs from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const input = fs.readFileSync(0, 'utf8').trim();
const { tool, arguments: args } = JSON.parse(input);
if (!tool) {
  console.error('missing tool');
  process.exit(1);
}

const transport = new StreamableHTTPClientTransport(new URL('https://mcp.openart.ai/mcp'));
const client = new Client({ name: 'site00-geo-bridge', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const result = await client.callTool({ name: tool, arguments: args ?? {} });
await client.close();
if (result.isError) {
  console.error(JSON.stringify(result));
  process.exit(2);
}
const text = result.content?.find((c) => c.type === 'text')?.text;
if (text) {
  process.stdout.write(text.trim());
} else {
  process.stdout.write(JSON.stringify(result));
}
