import { auth } from "@clerk/nextjs/server"
import { requireUser } from '@/features/auth/action/logged-in-user'
import { prisma } from '@/lib/db'
import { type UIMessage } from "ai"

export async function POST(req: Request) {

    //protect the route
    await auth.protect()

    //step 1 get the message from request
    const { message, id: messageId }: { message: UIMessage, id: string } = await req.json();

    // step 2 parse and validate input
    if (!message || !id) {
        return new Response("Message or Message Id is required.", { status: 400 });
    }

    //step 3 & 4 Authenticate and get current logged in user
    const loggedInuUser = await requireUser();

    // step 5 : Verify conversation ownership
    // We use find first instaed of unique here as we dont have unique indexes of this message and conversation.
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: messageId,
            userId: loggedInuUser.id
        }
    })

    if(!conversation){
        return new Response("Conversation not found.", { status: 400 });
    }

    


}