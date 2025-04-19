// TypeScript port of src/agents/items.py

// Stubs for OpenAI SDK types and other dependencies
export type TResponseInputItem = any;
export type TResponseOutputItem = any;
export type RunItem = any;
export type ResponseFunctionToolCall = any;
export type FunctionCallOutput = any;
export type ComputerCallOutput = any;
export type MessageOutputItem = any;

export class ItemHelpers {
    static extract_last_content(message: TResponseOutputItem): string {
        // Stub: In real implementation, check message type and extract content
        if (!message || !message.content) return "";
        const lastContent = message.content[message.content.length - 1];
        if (lastContent && typeof lastContent.text === "string") {
            return lastContent.text;
        } else if (lastContent && typeof lastContent.refusal === "string") {
            return lastContent.refusal;
        }
        return "";
    }

    static extract_last_text(message: TResponseOutputItem): string | null {
        if (message && message.content) {
            const lastContent = message.content[message.content.length - 1];
            if (lastContent && typeof lastContent.text === "string") {
                return lastContent.text;
            }
        }
        return null;
    }

    static input_to_new_input_list(
        input: string | TResponseInputItem[]
    ): TResponseInputItem[] {
        if (typeof input === "string") {
            return [
                {
                    content: input,
                    role: "user",
                },
            ];
        }
        // Deep copy for safety
        return JSON.parse(JSON.stringify(input));
    }

    static text_message_outputs(items: RunItem[]): string {
        let text = "";
        for (const item of items) {
            if (item && item.raw_item && item.raw_item.content) {
                text += ItemHelpers.text_message_output(item);
            }
        }
        return text;
    }

    static text_message_output(message: MessageOutputItem): string {
        let text = "";
        if (
            message &&
            message.raw_item &&
            Array.isArray(message.raw_item.content)
        ) {
            for (const item of message.raw_item.content) {
                if (typeof item.text === "string") {
                    text += item.text;
                }
            }
        }
        return text;
    }

    static tool_call_output_item(
        tool_call: ResponseFunctionToolCall,
        output: string
    ): FunctionCallOutput {
        return {
            call_id: tool_call.call_id,
            output: output,
            type: "function_call_output",
        };
    }
}
