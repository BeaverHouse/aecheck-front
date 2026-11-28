"use client";

import { useRouter } from "next/navigation";
import ToggleThemeButton from "../atoms/button/ToggleTheme";
import TopNavigateBox from "../atoms/TopNavigateBox";
import { AppInfo } from "../../constants";
import AECheckSidebar from "../molecules/Sidebar";

function AECheckMenu() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <nav className="flex items-center gap-2 p-3">
        <AECheckSidebar />
        <h1
          className="flex-grow whitespace-nowrap text-xl font-semibold cursor-pointer"
          onClick={() => router.push("/")}
        >
          {AppInfo.name}
        </h1>
        {/* Phones keep the header to one row; the theme switch is also in Settings. */}
        <div className="hidden sm:block">
          <ToggleThemeButton />
        </div>
        <TopNavigateBox />
      </nav>
    </header>
  );
}

export default AECheckMenu;
