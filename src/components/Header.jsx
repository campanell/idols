// src/components/Header.jsx
import { NavLink } from "react-router-dom";
import { House, Users } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[#b8000e] bg-[#DB0011] px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-white/80">
            idols 4 life
          </div>
          <div className="text-2xl font-bold leading-none text-white">I4L</div>
        </div>

        <nav
          className="grid h-10 w-full max-w-[240px] grid-cols-2 rounded-md border border-white/35 bg-white/10 p-1"
          aria-label="Primary navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-sm px-2 text-sm ${
                isActive
                  ? "bg-white text-[#DB0011]"
                  : "text-white hover:bg-white/15 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <House className="h-4 w-4" />
                <span>Home</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/roster"
            className={({ isActive }) =>
              `flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-sm px-2 text-sm ${
                isActive
                  ? "bg-white text-[#DB0011]"
                  : "text-white hover:bg-white/15 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Users className="h-4 w-4" />
                <span>Roster</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
