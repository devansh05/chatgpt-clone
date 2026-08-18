import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <ModeToggle />
      <h1>
        Hello Next
      </h1>
      <UserButton />
    </>
  );
}
