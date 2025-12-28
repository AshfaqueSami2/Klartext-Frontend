"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageNotFoundStateProps {
  title?: string;
  message?: string;
  backLabel?: string;
  backHref?: string;
}

export function PageNotFoundState({
  title = "Not Found",
  message = "The page you're looking for doesn't exist.",
  backLabel = "Go Back",
  backHref,
}: PageNotFoundStateProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
