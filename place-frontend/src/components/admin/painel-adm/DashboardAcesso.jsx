import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

export function DashboardAcesso (){
    return (
        <Link
        to="/admin/dashboard"
        className="flex items-center gap-4 rounded-x1 border border-line bg-linear-to-b from-card to-car-2 p-5 transition-colors hover:border-gold"
        >

        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/15 text-gold">
            <Icon name="dashboard" className="size-5.5"/>
        </span>
        <div className="flex-1">
            <h2 className="text-[15px] font-bold"> Dashboard</h2>
            <p className="text-xs text-ink-2">Acompanhe acessos, leads e agendamentos em tempo real.</p>
        </div>
        <Icon name="arrowRight" className="text-gold" />
        </Link>
    );
}