
"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Building2, ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function DesignTypeSelectionDialog({ open, onOpenChange, user }: { open: boolean, onOpenChange: (open: boolean) => void, user: User | null }) {
  const router = useRouter();

  const handleSelection = (path: string) => {
    onOpenChange(false);
    if (user) {
        router.push(path);
    } else {
        router.push(`/auth?next=${path}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Design Type</DialogTitle>
          <DialogDescription>
            Select an option below to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <button onClick={() => handleSelection("/generate")} className="text-left w-full">
            <Card className="hover:border-primary hover:bg-accent transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <Home className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Interior</h3>
                  <p className="text-sm text-muted-foreground">Redesign a room</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </button>
          <button onClick={() => handleSelection("/exterior")} className="text-left w-full">
            <Card className="hover:border-primary hover:bg-accent transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <Building2 className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Exterior</h3>
                  <p className="text-sm text-muted-foreground">Restyle a facade</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
