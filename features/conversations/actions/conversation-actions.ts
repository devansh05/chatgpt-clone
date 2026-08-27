"use server";

// Here we will add all the functions to perform actions on conversations prisma
// for the particular user

import { requireUser } from "@/features/auth/action/logged-in-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type UserType = {
    id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
};

// CREATE: Create new conversations for this user
async function createConversations(title: string = "New Chat") {

    const loggedInUser = await requireUser()

    // prisma.tableName.create({
    // params
    // })

    return await prisma.conversation.create({
        data: {
            title: title.trim() || 'New Chat',
            userId: loggedInUser.id,
        },
    })
}


// READ: List all the existing conversations for this user
async function listAllConversations() {

    const loggedInUser = await requireUser()

    // prisma.tableName.operation({
    // where: condition,
    // order:condition,
    // select: condition-the data we want to fetch from db})

    return await prisma.conversation.findMany({
        where: { userId: loggedInUser.id, isArchived: false },
        orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
        },
    })
}

// UPDATE: Update existing conversations for this user
async function updateConversations(conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }) {

    const loggedInUser = await requireUser()

    // This function is to make sure that the user is updating operations on his own convesations
    await assertOwnConversation(conversationId, loggedInUser.id)

    // prisma.tableName.delete({
    // where:{
    // params
    // }
    // })

    await prisma.conversation.update({
        where: {
            id: conversationId,
            userId: loggedInUser.id
        },
        data: {
            ...(data.title !== undefined ? { title: data.title.trim() || "New Chat" } : {}),
            ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
        },
    });

}

// DELETE: Delete existing conversations for this user
async function deleteConversations(conversationId: string) {

    const loggedInUser = await requireUser()

    // This function is to make sure that the user is deleting operations on his own convesations
    await assertOwnConversation(conversationId, loggedInUser.id)

    // prisma.tableName.delete({
    // where:{
    // params
    // }
    // })

    await prisma.conversation.delete({
        where: {
            id: conversationId,
            userId: loggedInUser.id
        }
    });

    revalidatePath("/");
}


async function getUserConversations(conversationId: string) {

    const loggedInUser = await requireUser()

    // This function is to make sure that the user is deleting operations on his own convesations
    return await assertOwnConversation(conversationId, loggedInUser.id)
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

export { listAllConversations, createConversations, updateConversations, deleteConversations, getUserConversations }