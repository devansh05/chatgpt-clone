"use server";

// Here we will add all the functions to perform actions on conversations prisma
// for the particular user

import { requireUser } from "@/features/auth/action/logged-in-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { MessageRole, Conversation, Message } from "@/lib/generated/prisma/client";

/** Shape of a conversation row returned in the sidebar list. */
export type MessagesListItem = {
    id: string;
    conversationId: string;
    role: MessageRole;
    status: "PENDING" | "COMPLETE" | "ERROR";
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

// CREATE: Create new messages for this conversation
async function createMessage(conversationId: string, content: string) {

    const loggedInUser = await requireUser()
    const conversation: ConversationListItem | null = await assertOwnConversation(conversationId, loggedInUser.id);

    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }

    // prisma.tableName.create({
    // params
    // })

    // create a messafe
    const message: MessagesListItem = await prisma.message.create({
        data: {
            conversationId,
            role: "USER",
            status: "COMPLETE",
            content: trimmed,
        },
    })

    // If the conversation title is "New Chat" or empty,
    // it sets the title to the first message text.
    const shouldRename: boolean =
        conversation?.title === "New Chat" || conversation?.title.trim() === "";

    // this updates the parent conversation after a new user message is created.
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastMessageAt: new Date(),
            ...(shouldRename
                ? {
                    title:
                        trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed,
                }
                : {}),
        },
    });

    // After saving this message, refresh both the conversation list page and this specific chat page,
    // so the UI shows the latest database state.
    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return message;
}


// READ: List all the existing messages for this conversation
async function listAllMessages(conversationId: string) {

    const loggedInUser = await requireUser()

    await assertOwnConversation(conversationId, loggedInUser.id);

    // prisma.tableName.operation({
    // where: condition,
    // order:condition,
    // select: condition-the data we want to fetch from db})

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: [{ createdAt: 'asc' }],
        select: {
            id: true,
            conversationId: true,
            role: true, // role is used to define if the message is sent by user or agent
            status: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    })
}

// UPDATE: Update existing messages for this conversation
async function updateMessage(messageId: string, content: string) {

    const loggedInUser = await requireUser()

    const trimmed = content.trim();
  
    if (!trimmed) {
      throw new Error("Message cannot be empty");
    }

    const existing = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });
    
    if (!existing || existing.conversation.userId !== loggedInUser.id) {
      throw new Error("Message not found");
    }

    // prisma.tableName.delete({
    // where:{
    // params
    // }
    // })

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { content: trimmed },
    });

    revalidatePath(`/c/${existing.conversationId}`);
    return message;

}

// DELETE: Delete existing message
async function deleteMessage(messageId: string) {

    const loggedInUser = await requireUser()

    const existing = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
    });

    // here we are checking if message id exists for this user from conversation object in message table
    if (!existing || existing.conversation.userId !== loggedInUser.id) {
        throw new Error("Message not found");
    }

    // prisma.tableName.delete({
    // where:{
    // params
    // }
    // })

    await prisma.message.delete({ where: { id: messageId } });

    revalidatePath(`/c/${existing.conversationId}`);
    return { id: messageId, conversationId: existing.conversationId };
}

// This function is to make sure that the user is doing operations on his own convesations
async function assertOwnConversation(conversationId: string, userId: string) {

    const conversationFound = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: userId
        }
    })
    if (!conversationFound) {
        throw new Error("Conversation not found")
    }

    return conversationFound || null
}

export { listAllMessages, createMessage, updateMessage, deleteMessage }