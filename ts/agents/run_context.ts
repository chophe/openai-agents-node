// TypeScript port of src/agents/run_context.py

// Stub for Usage type
type Usage = any;

export type TContext = any;

export class RunContextWrapper<TContext = any> {
    context: TContext;
    usage: Usage;

    constructor(params: { context: TContext; usage?: Usage }) {
        this.context = params.context;
        this.usage = params.usage ?? {};
    }
}
