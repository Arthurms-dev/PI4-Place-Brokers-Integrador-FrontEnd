import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

export function Topbar({ user, menuOpen, onMenuToggle }) {
  return (
    <header className="sticky top-0 z-10 flex h-16.5 items-center gap-4 border-b border-line-soft bg-page px-4.5 sm:gap-6 lg:px-7.5">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Abrir menu"
        aria-controls="admin-sidebar"
        aria-expanded={menuOpen}
        className="grid size-9.5 place-items-center rounded-lg border border-line lg:hidden"
      >
        <Icon name="menu" />
      </button>

      <label className="flex h-8.5 max-w-[460px] flex-1 items-center gap-3 rounded-lg border border-line bg-card-2 px-4 text-ink-3 focus-within:border-gold">
        <Icon name="search" />
        <input
          type="search"
          placeholder="Buscar por imóvel, cliente, lead..."
          aria-label="Buscar"
          className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-3"
        />
      </label>

      <div className="ml-auto flex items-center gap-4.5">
        <button type="button" aria-label="Notificações" className="relative grid size-8.5 place-items-center text-ink-2">
          <Icon name="bell" />
          {user.unreadNotifications > 0 && (
            <span className="absolute right-0 top-0 grid h-3.75 min-w-3.75 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#1a1408]">
              {user.unreadNotifications}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 border-l border-line-soft pl-4.5">
          <Avatar name={user.name} src={user.avatarUrl} />
          <div className="hidden sm:block">
            <div className="text-[13px] font-medium">{user.name}</div>
            <div className="text-[11px] text-ink-3">{user.role}</div>
          </div>
          <Icon name="chevronDown" className="hidden size-3.5 sm:block" />
        </div>
      </div>
    </header>
  );
}