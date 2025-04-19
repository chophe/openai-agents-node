// TypeScript port of src/agents/guardrail.py

// Stubs for dependencies (to be replaced with actual imports)
import { Agent } from "./agent";
import { RunContextWrapper, TContext } from "./run_context";
// import { UserError } from "./exceptions";
// import { TResponseInputItem } from "./items";

export interface GuardrailFunctionOutput {
    output_info: any;
    tripwire_triggered: boolean;
}

export interface InputGuardrailResult<TContext = any> {
    guardrail: InputGuardrail<TContext>;
    output: GuardrailFunctionOutput;
}

export interface OutputGuardrailResult<TContext = any> {
    guardrail: OutputGuardrail<TContext>;
    agent_output: any;
    agent: Agent<any>;
    output: GuardrailFunctionOutput;
}

export class InputGuardrail<TContext = any> {
    guardrail_function: (
        context: RunContextWrapper<TContext>,
        agent: Agent<any>,
        input: string | any[]
    ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput;
    name?: string | null;

    constructor(params: {
        guardrail_function: (
            context: RunContextWrapper<TContext>,
            agent: Agent<any>,
            input: string | any[]
        ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput;
        name?: string | null;
    }) {
        this.guardrail_function = params.guardrail_function;
        this.name = params.name ?? null;
    }

    get_name(): string {
        if (this.name) return this.name;
        // @ts-ignore
        return this.guardrail_function.name || "guardrail_function";
    }

    async run(
        agent: Agent<any>,
        input: string | any[],
        context: RunContextWrapper<TContext>
    ): Promise<InputGuardrailResult<TContext>> {
        if (typeof this.guardrail_function !== "function") {
            // throw new UserError(`Guardrail function must be callable, got ${this.guardrail_function}`);
            throw new Error(
                `Guardrail function must be callable, got ${this.guardrail_function}`
            );
        }
        const output = this.guardrail_function(context, agent, input);
        if (output instanceof Promise) {
            return {
                guardrail: this,
                output: await output,
            };
        }
        return {
            guardrail: this,
            output: output,
        };
    }
}

export class OutputGuardrail<TContext = any> {
    guardrail_function: (
        context: RunContextWrapper<TContext>,
        agent: Agent<any>,
        agent_output: any
    ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput;
    name?: string | null;

    constructor(params: {
        guardrail_function: (
            context: RunContextWrapper<TContext>,
            agent: Agent<any>,
            agent_output: any
        ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput;
        name?: string | null;
    }) {
        this.guardrail_function = params.guardrail_function;
        this.name = params.name ?? null;
    }

    get_name(): string {
        if (this.name) return this.name;
        // @ts-ignore
        return this.guardrail_function.name || "guardrail_function";
    }

    async run(
        context: RunContextWrapper<TContext>,
        agent: Agent<any>,
        agent_output: any
    ): Promise<OutputGuardrailResult<TContext>> {
        if (typeof this.guardrail_function !== "function") {
            // throw new UserError(`Guardrail function must be callable, got ${this.guardrail_function}`);
            throw new Error(
                `Guardrail function must be callable, got ${this.guardrail_function}`
            );
        }
        const output = this.guardrail_function(context, agent, agent_output);
        if (output instanceof Promise) {
            return {
                guardrail: this,
                agent,
                agent_output,
                output: await output,
            };
        }
        return {
            guardrail: this,
            agent,
            agent_output,
            output: output,
        };
    }
}

// Decorator functions

export function input_guardrail<TContext = any>(
    funcOrOptions?:
        | ((
              context: RunContextWrapper<TContext>,
              agent: Agent<any>,
              input: string | any[]
          ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput)
        | { name?: string | null }
): any {
    if (typeof funcOrOptions === "function") {
        // Used as @input_guardrail
        return new InputGuardrail<TContext>({
            guardrail_function: funcOrOptions,
        });
    }
    // Used as @input_guardrail({ name: ... })
    return function (
        func: (
            context: RunContextWrapper<TContext>,
            agent: Agent<any>,
            input: string | any[]
        ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput
    ) {
        return new InputGuardrail<TContext>({
            guardrail_function: func,
            name: funcOrOptions?.name ?? null,
        });
    };
}

export function output_guardrail<TContext = any>(
    funcOrOptions?:
        | ((
              context: RunContextWrapper<TContext>,
              agent: Agent<any>,
              agent_output: any
          ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput)
        | { name?: string | null }
): any {
    if (typeof funcOrOptions === "function") {
        // Used as @output_guardrail
        return new OutputGuardrail<TContext>({
            guardrail_function: funcOrOptions,
        });
    }
    // Used as @output_guardrail({ name: ... })
    return function (
        func: (
            context: RunContextWrapper<TContext>,
            agent: Agent<any>,
            agent_output: any
        ) => Promise<GuardrailFunctionOutput> | GuardrailFunctionOutput
    ) {
        return new OutputGuardrail<TContext>({
            guardrail_function: func,
            name: funcOrOptions?.name ?? null,
        });
    };
}
