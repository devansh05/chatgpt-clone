import { auth } from "@clerk/nextjs/server";
import { requireUser } from '@/features/auth/action/logged-in-user';
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { prisma } from '@/lib/db';
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { getChatModel } from '@/features/ai/config/model'


export async function POST(req: Request) {

    //protect the route
    await auth.protect()

    //step 1 get the message from request
    const { message, id: messageId }: { message: UIMessage, id: string } = await req.json();

    // step 2 parse and validate input
    if (!message || !messageId) {
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

    if (!conversation) {
        return new Response("Conversation not found.", { status: 400 });
    }

    // Step 6: Load previous messages as the conversation & user are verified

    const previousMessages = await loadChatMessages(conversation.id);

    // step 7 check if messages are previously saved else save the new message
    const alreadySaved = previousMessages.some(
        (storedMessage) => storedMessage.id === message.id
    )

    if (!alreadySaved) {
        await saveChatMessages(conversation.id, [message]);
    }

    // fetch all the messages from conversation
    const messages = alreadySaved ? previousMessages : [...previousMessages, message];

    // step 8 prepare and start streaming

    const streamResult = streamText({
        model: getChatModel(conversation.model),
        system: conversation.systemPrompt || "You are an extremly helpful assistant.",
        // this is used to convert the messages received by user to model compatible format
        messages: await convertToModelMessages(messages)
    })
    // step 9 this is to continue stream even if user closed conversation or killed the app
    streamResult.consumeStream()

    // step 10 now create the response format from UI message stream, and transform this stream to Server Side Events format
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: streamResult.stream,
            originalMessages: messages,
            /* incase if you dont have an existing message id create a msg id on the go
             and keep size 16 as that matches our uuid and cuid that we set earlier
             'msg' as unique identifer to get the messages generated here */
            generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),

            //step 11 finally save the messages in databse upon stream end
            onEnd: async ({ messages: finalMessages }) => {
                try {
                    await saveChatMessages(conversation.id, finalMessages, { updateTitle: false }) //donot update the title of this conversation
                } catch {
                    console.error("Failed to save chat messages after stream completion.");
                }
            }
        })

    })
}
