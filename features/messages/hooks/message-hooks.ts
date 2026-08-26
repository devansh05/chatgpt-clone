"use_client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    createMessage,
    listAllMessages,
    updateMessage,
    deleteMessage,
} from "@/features/messages/actions/message-actions";
import { queryKeys } from "../../utils/query-keys";


export function useMessages(conversationId: string) {
    return useQuery({
        queryKey: queryKeys.messages.byConversation(conversationId ?? "none"),
        queryFn: () => listAllMessages(conversationId),
        enabled: Boolean(conversationId),
    });
}

export function useCreateMessage(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content: string) => createMessage(conversationId, content),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not send message");
        },
    });
}

export function useUpdateMessage(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            content
        }: {
            id: string;
            content: string;
        }) => updateMessage(id, content),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not update message");
        },
    });
}

export function useDeleteMessage(conversationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMessage(id),
        onSuccess: ({ id }) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.messages.byConversation(id),
            });
            toast.success("Message deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not delete message");
        },
    });
}