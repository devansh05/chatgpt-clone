import { getUserConversations } from '@/features/conversations/actions/conversation-actions'
import { notFound } from 'next/navigation'
import { loadChatMessages } from '@/features/ai/actions/chat-store'
import { ConversationView } from '@/features/conversations/components/conversation-view'

type ConversationProps = {

    params: Promise<{ id: string }>
}

const NewConversationScreen = async ({ params }: ConversationProps) => {

    const { id } = await params;

    try {
        await getUserConversations(id)
    }
    catch {
        notFound()
    }

    const initialMessages = await loadChatMessages(id);

    return (
        <div>{`Conversation Id : ${id}`}
            <ConversationView
                key={id}
                conversationId={id}
                initialMessages={initialMessages}
            />
        </div>
    )
}

export default NewConversationScreen
