import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TOOLS, toolLink, ToolError } from "./tools.js";

const INSTRUCTIONS =
  "Snowkit tools run on this computer and never send files or text anywhere. Pass full file paths. " +
  "Outputs are saved next to the input file unless an output path is given, and existing files are never replaced unless overwrite is true. " +
  "Use pdf_info before splitting or extracting pages when the page count is unknown.";

function message(e) {
  if (e instanceof ToolError) return e.message;
  return "Something went wrong: " + String((e && e.message) || e);
}

export function createServer(version) {
  const server = new McpServer(
    { name: "snowkit", title: "Snowkit", version, description: "Private tools that run on your computer.", websiteUrl: "https://snowkit.io" },
    { instructions: INSTRUCTIONS }
  );
  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: z.object(tool.schema).strict(),
        annotations: { title: tool.title, readOnlyHint: !!tool.readOnly, destructiveHint: false, idempotentHint: !!tool.readOnly, openWorldHint: false },
      },
      async (args) => {
        try {
          const result = await tool.run(args || {});
          const parts = [result.text];
          if (result.output !== undefined) parts.push(result.output.replace(/\n$/, ""));
          parts.push("Open in Snowkit: " + toolLink(tool, args));
          return { content: [{ type: "text", text: parts.join("\n\n") }] };
        } catch (e) {
          return { content: [{ type: "text", text: message(e) }], isError: true };
        }
      }
    );
  }
  return server;
}

export async function startServer(version) {
  const server = createServer(version);
  await server.connect(new StdioServerTransport());
  return server;
}
