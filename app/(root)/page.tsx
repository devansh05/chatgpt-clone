import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { initiateConversation } from '@/features/home/actions/actions'
import { redirect } from "next/navigation";

export default async function Home() {

  const conversationId = await initiateConversation()
  if (conversationId) {
    redirect(`/c/${conversationId}`)
  } else {
    return (
      <>
        <ModeToggle />
        <h1>
          Logged in user not found.
        </h1>
        <UserButton />
      </>
    );
  }
}
