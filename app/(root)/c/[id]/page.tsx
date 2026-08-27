import React from 'react'

type ConversationProps = {

    params: Promise<{ id: string }>
}

const NewConversationScreen = async ({ params }: ConversationProps) => {

    const { id } = await params;

    return (
        <div>{`Conversation Id : ${id}`}</div>
    )
}

export default NewConversationScreen