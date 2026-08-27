import React from 'react'
import { requireUser } from '@/features/auth/action/logged-in-user'
import { prisma } from '@/lib/db'

export const initiateConversation = async () => {

    console.log(`🟡 LOG 1 - : `,)
    const user = await requireUser();
    console.log(`🟡 LOG - user: `, user)

    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            title: "New Chat"
        }
    });

    console.log(`🟡 LOG - conversation: `, conversation.id)

    return conversation.id;

}