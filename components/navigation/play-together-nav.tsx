import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export function PlayTogetherNav() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/play-together">
        <Button variant="ghost" className="gap-2">
          <Users className="h-4 w-4" />
          Play Together
        </Button>
      </Link>
    </div>
  );
}
