import Link from "next/link";
import { Film } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <div className="bg-primary p-2 rounded-lg">
              <Film className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Moovie</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
