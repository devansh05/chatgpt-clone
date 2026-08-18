import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { onBoardUser } from '@/features/auth/action/onboard';


const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
    await auth.protect();
    await onBoardUser();
    
    return (
        <div>{children}</div>
    )
}

export default RootGroupLayout