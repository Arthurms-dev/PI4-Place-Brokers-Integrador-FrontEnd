import { Outlet } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="h-10" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}