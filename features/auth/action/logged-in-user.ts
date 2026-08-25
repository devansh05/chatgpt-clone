// find the details of currently logged in user

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from "@/lib/db";

// This is just for practice user the clerk object logged in to db
const getLoggedInUser = async () => {

    // Use `auth.protect()` middleware to redirect the user to the sign-in page if they are not signed in
    await auth.protect()

    // Use `currentUser()` to get the Backend `User` object
    const user = await currentUser()
    if (!user) return null
    // Use `user` to render user details or create UI elements
    return user

}

// Use this user object instead of above one
const requireUser = async () => {

    const authObj = await auth.protect();
    const { userId } = authObj

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });
    if (!user) {
        throw new Error("User not found. Complete onboarding first.");
    }
    return user;

}

export { getLoggedInUser, requireUser }