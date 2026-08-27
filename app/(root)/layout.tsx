import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { onBoardUser } from '@/features/auth/action/onboard';
import { ChatShell } from '@/features/conversations/components/chat-shell'


const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
    await auth.protect();
    await onBoardUser();

    return (
        <ChatShell>
            <div>{children}</div>
        </ChatShell>
    )
}

export default RootGroupLayout