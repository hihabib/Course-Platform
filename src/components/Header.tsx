import { BookmarkedVideosDrawer } from "./BookmarkedVideosDrawer";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-8">
        <div className="flex flex-1">
          <a href="/" className="flex items-center gap-2">
            {/* You can add your logo here */}
            <span className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              Course Platform
            </span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            {/* Add more nav items here if needed */}
            <BookmarkedVideosDrawer />
          </nav>
        </div>
      </div>
    </header>
  );
}
