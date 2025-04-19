// TypeScript port of src/agents/tool.py

import { RunContextWrapper } from "./run_context";

export interface FunctionToolResult {
    tool: FunctionTool;
    output: any;
    run_item: any;
}

export interface FunctionTool {
    name: string;
    description: string;
    params_json_schema: Record<string, any>;
    on_invoke_tool: (
        context: RunContextWrapper<any>,
        input: string
    ) => Promise<any>;
    strict_json_schema?: boolean;
}

export interface FileSearchTool {
    // Stub for now
    name: string;
}

export interface WebSearchTool {
    // Stub for now
    name: string;
}

export interface ComputerTool {
    // Stub for now
    name: string;
}

export type Tool = FunctionTool | FileSearchTool | WebSearchTool | ComputerTool;

export function default_tool_error_function(
    ctx: RunContextWrapper<any>,
    error: Error
): string {
    return `An error occurred while running the tool. Please try again. Error: ${String(
        error
    )}`;
}

// Minimal functionTool decorator/factory
export function functionTool(params: {
    name: string;
    description?: string;
    run: (context: RunContextWrapper<any>, input: string) => Promise<any>;
}): FunctionTool {
    return {
        name: params.name,
        description: params.description || "",
        params_json_schema: {},
        on_invoke_tool: params.run,
        strict_json_schema: true,
    };
}
