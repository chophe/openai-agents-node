// TypeScript port of src/agents/handoffs.py

// Stubs for dependencies (to be replaced with actual imports)
import { Agent } from "./agent";
import { RunContextWrapper, TContext } from "./run_context";
// import { RunItem, TResponseInputItem } from "./items";

export interface HandoffInputData {
    input_history: string | any[]; // tuple<TResponseInputItem, ...>
    pre_handoff_items: any[]; // tuple<RunItem, ...>
    new_items: any[]; // tuple<RunItem, ...>
}

export type HandoffInputFilter = (data: HandoffInputData) => HandoffInputData;

export class Handoff<TContext = any> {
    tool_name: string;
    tool_description: string;
    input_json_schema: Record<string, any>;
    on_invoke_handoff: (
        context: RunContextWrapper<any>,
        input_json: string
    ) => Promise<Agent<TContext>>;
    agent_name: string;
    input_filter?: HandoffInputFilter | null;
    strict_json_schema: boolean;

    constructor(params: {
        tool_name: string;
        tool_description: string;
        input_json_schema: Record<string, any>;
        on_invoke_handoff: (
            context: RunContextWrapper<any>,
            input_json: string
        ) => Promise<Agent<TContext>>;
        agent_name: string;
        input_filter?: HandoffInputFilter | null;
        strict_json_schema?: boolean;
    }) {
        this.tool_name = params.tool_name;
        this.tool_description = params.tool_description;
        this.input_json_schema = params.input_json_schema;
        this.on_invoke_handoff = params.on_invoke_handoff;
        this.agent_name = params.agent_name;
        this.input_filter = params.input_filter ?? null;
        this.strict_json_schema = params.strict_json_schema ?? true;
    }

    get_transfer_message(agent: Agent<any>): string {
        return `{'assistant': '${agent.name}'}`;
    }

    static default_tool_name(agent: Agent<any>): string {
        // TODO: Implement transform_string_function_style
        return `transfer_to_${agent.name}`;
    }

    static default_tool_description(agent: Agent<any>): string {
        return `Handoff to the ${agent.name} agent to handle the request. ${
            agent.handoff_description || ""
        }`;
    }
}

// Overloads for handoff factory
type OnHandoffWithInput<THandoffInput> = (
    context: RunContextWrapper<any>,
    input: THandoffInput
) => any;
type OnHandoffWithoutInput = (context: RunContextWrapper<any>) => any;

export function handoff<TContext = any, THandoffInput = any>(
    agent: Agent<TContext>,
    options?: {
        tool_name_override?: string | null;
        tool_description_override?: string | null;
        on_handoff?: OnHandoffWithInput<THandoffInput> | OnHandoffWithoutInput;
        input_type?: any; // Not used in TS version
        input_filter?: HandoffInputFilter | null;
    }
): Handoff<TContext> {
    // For simplicity, we do not enforce input_type or type_adapter logic in this TS version.
    const tool_name =
        options?.tool_name_override || Handoff.default_tool_name(agent);
    const tool_description =
        options?.tool_description_override ||
        Handoff.default_tool_description(agent);
    const input_json_schema = {}; // TODO: Support input_type to JSON schema if needed

    async function _invoke_handoff(
        ctx: RunContextWrapper<any>,
        input_json: string = ""
    ): Promise<Agent<TContext>> {
        if (options?.on_handoff) {
            // If on_handoff expects two args, pass input_json as second arg
            if (options.on_handoff.length === 2) {
                await (options.on_handoff as OnHandoffWithInput<THandoffInput>)(
                    ctx,
                    input_json as any
                );
            } else {
                await (options.on_handoff as OnHandoffWithoutInput)(ctx);
            }
        }
        return agent;
    }

    return new Handoff<TContext>({
        tool_name,
        tool_description,
        input_json_schema,
        on_invoke_handoff: _invoke_handoff,
        input_filter: options?.input_filter ?? null,
        agent_name: agent.name,
        strict_json_schema: true,
    });
}
