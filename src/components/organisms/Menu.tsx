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
      <nav className="flex flex-wrap justify-between items-center gap-2 p-3">
        <div className="flex flex-grow items-center gap-2">
          <AECheckSidebar />
          <h1
            className="flex-grow text-xl font-semibold cursor-pointer"
            onClick={() => router.push("/")}
          >
            {AppInfo.name}
          </h1>
          <ToggleThemeButton />
        </div>
        <TopNavigateBox />
      </nav>
    </header>
  );
}

export default AECheckMenu;
