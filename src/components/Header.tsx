import { Link } from "react-router-dom";
import { BookmarkedVideosDrawer } from "./BookmarkedVideosDrawer";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center px-4 md:px-8">
        <div className="flex flex-1">
          <Link to="/" className="flex items-center gap-2">
            {/* You can add your logo here */}
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              Course Platform
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <nav className="flex items-center">
            {/* Add more nav items here if needed */}
            <BookmarkedVideosDrawer />
          </nav>
        </div>
      </div>
    </header>
  );
}
