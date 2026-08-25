// Query keys are the keys used to cache data
export const queryKeys = {
    conversations: {
        all: ["conversations"] as const,
        detail: (id: string) => ["conversations", id] as const,
    },
    messages: {
        byConversation: (conversationId: string) =>
            ["messages", conversationId] as const
    }
}