// TypeScript port of src/agents/agent.py

import { InputGuardrail, OutputGuardrail } from "./guardrail";
import { Handoff } from "./handoffs";
import { ItemHelpers } from "./items";
// import { logger } from './logger'; // TODO: Port logger if needed
// import { MCPUtil } from './mcp';
import { ModelSettings } from "./model_settings";
// import { Model } from './models/interface';
import { RunContextWrapper, TContext } from "./run_context";
import { FunctionToolResult, Tool, functionTool } from "./tool";
// import { MaybeAwaitable } from './util/_types';

// Type Aliases and Interfaces

export interface ToolsToFinalOutputResult {
    is_final_output: boolean;
    final_output?: any | null;
}

export type ToolsToFinalOutputFunction<TContext> = (
    context: RunContextWrapper<TContext>,
    results: FunctionToolResult[]
) => Promise<ToolsToFinalOutputResult> | ToolsToFinalOutputResult;

export interface StopAtTools {
    stop_at_tool_names: string[];
}

export interface MCPConfig {
    convert_schemas_to_strict?: boolean;
}

export type ToolUseBehavior<TContext> =
    | "run_llm_again"
    | "stop_on_first_tool"
    | StopAtTools
    | ToolsToFinalOutputFunction<TContext>;

// Agent class

export class Agent<TContext = any> {
    name: string;
    instructions?:
        | string
        | ((
              context: RunContextWrapper<TContext>,
              agent: Agent<TContext>
          ) => Promise<string> | string)
        | null;
    handoff_description?: string | null;
    handoffs: Array<Agent<any> | Handoff<TContext>>;
    model?: string | any | null; // Model type to be defined
    model_settings: ModelSettings;
    tools: Tool[];
    mcp_servers: any[]; // MCPServer type to be defined
    mcp_config: MCPConfig;
    input_guardrails: InputGuardrail<TContext>[];
    output_guardrails: OutputGuardrail<TContext>[];
    output_type?: any;
    hooks?: any; // AgentHooks<TContext> to be defined
    tool_use_behavior: ToolUseBehavior<TContext>;
    reset_tool_choice: boolean;

    constructor(params: {
        name: string;
        instructions?:
            | string
            | ((
                  context: RunContextWrapper<TContext>,
                  agent: Agent<TContext>
              ) => Promise<string> | string)
            | null;
        handoff_description?: string | null;
        handoffs?: Array<Agent<any> | Handoff<TContext>>;
        model?: string | any | null;
        model_settings?: ModelSettings;
        tools?: Tool[];
        mcp_servers?: any[];
        mcp_config?: MCPConfig;
        input_guardrails?: InputGuardrail<TContext>[];
        output_guardrails?: OutputGuardrail<TContext>[];
        output_type?: any;
        hooks?: any;
        tool_use_behavior?: ToolUseBehavior<TContext>;
        reset_tool_choice?: boolean;
    }) {
        this.name = params.name;
        this.instructions = params.instructions ?? null;
        this.handoff_description = params.handoff_description ?? null;
        this.handoffs = params.handoffs ?? [];
        this.model = params.model ?? null;
        this.model_settings = params.model_settings ?? new ModelSettings();
        this.tools = params.tools ?? [];
        this.mcp_servers = params.mcp_servers ?? [];
        this.mcp_config = params.mcp_config ?? {};
        this.input_guardrails = params.input_guardrails ?? [];
        this.output_guardrails = params.output_guardrails ?? [];
        this.output_type = params.output_type ?? undefined;
        this.hooks = params.hooks ?? undefined;
        this.tool_use_behavior = params.tool_use_behavior ?? "run_llm_again";
        this.reset_tool_choice = params.reset_tool_choice ?? true;
    }

    clone(changes: Partial<Agent<TContext>>): Agent<TContext> {
        return new Agent<TContext>({ ...this, ...changes });
    }

    asTool(
        tool_name?: string | null,
        tool_description?: string | null,
        custom_output_extractor?: ((output: any) => Promise<string>) | null
    ): Tool {
        // TODO: Implement functionTool decorator logic
        // For now, return a stub Tool
        const name = tool_name || this.name;
        const description = tool_description || "";
        // The actual implementation would wrap the agent as a callable tool
        return {
            name,
            description,
            async run(
                context: RunContextWrapper<TContext>,
                input: string
            ): Promise<string> {
                // TODO: Call Runner.run and extract output
                if (custom_output_extractor) {
                    // TODO: Use custom_output_extractor
                    return await custom_output_extractor({});
                }
                // TODO: Use ItemHelpers.text_message_outputs
                return "";
            },
        } as Tool;
    }

    async getSystemPrompt(
        run_context: RunContextWrapper<TContext>
    ): Promise<string | null> {
        if (typeof this.instructions === "string") {
            return this.instructions;
        } else if (typeof this.instructions === "function") {
            const result = this.instructions(run_context, this);
            if (result instanceof Promise) {
                return await result;
            } else {
                return result;
            }
        } else if (this.instructions != null) {
            // logger.error(`Instructions must be a string or a function, got ${this.instructions}`);
            return null;
        }
        return null;
    }

    async getMcpTools(): Promise<Tool[]> {
        const convert_schemas_to_strict =
            this.mcp_config.convert_schemas_to_strict ?? false;
        // TODO: Implement MCPUtil.get_all_function_tools
        return [];
    }

    async getAllTools(): Promise<Tool[]> {
        const mcp_tools = await this.getMcpTools();
        return [...mcp_tools, ...this.tools];
    }
}
