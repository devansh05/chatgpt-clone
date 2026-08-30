import { requireUser } from '@/features/auth/action/logged-in-user'
import { prisma } from '@/lib/db'

export const initiateConversation = async () => {

    const user = await requireUser();

    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            title: "New Chat"
        }
    });

    return conversation.id;

}
