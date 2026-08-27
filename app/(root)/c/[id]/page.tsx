import React from 'react'
import { getUserConversations } from '@/features/conversations/actions/conversation-actions'
import { notFound } from 'next/navigation'

type ConversationProps = {

    params: Promise<{ id: string }>
}

const NewConversationScreen = async ({ params }: ConversationProps) => {

    const { id } = await params;

    try {
        await getUserConversations(id)
    }
    catch (error) {
        console.log(`🟡 LOG - error: `, error)
        notFound()
    }

    return (
        <div>{`Conversation Id : ${id}`}</div>
    )
}

export default NewConversationScreen