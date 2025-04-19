// TypeScript port of src/agents/model_settings.py

// Stubs for OpenAI types
type Reasoning = any;
type Query = any;
type Body = any;

export class ModelSettings {
    temperature?: number | null;
    top_p?: number | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
    tool_choice?: "auto" | "required" | "none" | string | null;
    parallel_tool_calls?: boolean | null;
    truncation?: "auto" | "disabled" | null;
    max_tokens?: number | null;
    reasoning?: Reasoning | null;
    metadata?: { [key: string]: string } | null;
    store?: boolean | null;
    include_usage?: boolean | null;
    extra_query?: Query | null;
    extra_body?: Body | null;

    constructor(params?: Partial<ModelSettings>) {
        this.temperature = params?.temperature ?? null;
        this.top_p = params?.top_p ?? null;
        this.frequency_penalty = params?.frequency_penalty ?? null;
        this.presence_penalty = params?.presence_penalty ?? null;
        this.tool_choice = params?.tool_choice ?? null;
        this.parallel_tool_calls = params?.parallel_tool_calls ?? null;
        this.truncation = params?.truncation ?? null;
        this.max_tokens = params?.max_tokens ?? null;
        this.reasoning = params?.reasoning ?? null;
        this.metadata = params?.metadata ?? null;
        this.store = params?.store ?? null;
        this.include_usage = params?.include_usage ?? null;
        this.extra_query = params?.extra_query ?? null;
        this.extra_body = params?.extra_body ?? null;
    }

    resolve(override?: Partial<ModelSettings> | null): ModelSettings {
        if (!override) return new ModelSettings({ ...this });
        const changes: Partial<ModelSettings> = {};
        for (const key of Object.keys(this) as (keyof ModelSettings)[]) {
            if (
                Object.prototype.hasOwnProperty.call(override, key) &&
                override[key] !== undefined &&
                override[key] !== null
            ) {
                changes[key] = override[key];
            } else {
                changes[key] = this[key];
            }
        }
        return new ModelSettings(changes);
    }
}
