'use client';

import type { CastMember } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface CastSectionProps {
    cast: CastMember[];
}

export function CastSection({ cast }: CastSectionProps) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex w-max space-x-4 p-4">
                    {cast.map(member => (
                        <div key={member.id} className="flex flex-col items-center w-32 text-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={member.profilePath} alt={member.name} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-sm mt-2 truncate w-full">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate w-full">{member.character}</p>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </section>
    )
}
