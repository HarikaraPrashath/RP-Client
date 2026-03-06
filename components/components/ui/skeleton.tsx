import React from "react";
import { cn } from "@/lib/utils-r";

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-glass/10 backdrop-blur-sm", className)}
            {...props}
        />
    );
}
