import { Outlet } from "react-router-dom";
import { ContatoProvider } from "./ContatoProvider";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function SiteLayout() {
  return (
    <ContatoProvider>
      <div className="pb-site min-h-screen bg-page text-ink">
        <SiteHeader />
        <Outlet />
        <SiteFooter />
      </div>
    </ContatoProvider>
  );
}
