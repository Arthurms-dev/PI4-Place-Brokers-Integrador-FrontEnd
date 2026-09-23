import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

const STATUS = {
  novo: { label: "Novo", className: "border-info bg-info/12 text-[#bcd8ff]" },
  atendimento: { label: "Em atendimento", className: "border-info bg-info/18 text-white" },
  qualificado: { label: "Qualificado", className: "border-[#2fbf7f] bg-ok/12 text-[#7ff0bc]" },
  convertido: { label: "Convertido", className: "border-[#2fbf7f] bg-ok/12 text-[#7ff0bc]" },
};

export function RecentLeads({ leads }) {
  return (
    <Card className="overflow-hidden pb-0">
      <CardHeader
        title="Leads Recentes"
        description="Últimos contatos recebidos"
        action={
          <Link to="/admin/leads" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-gold hover:underline">
            Ver todos <Icon name="arrowRight" className="size-3.5" />
          </Link>
        }
      />

      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-left">
          <thead>
            <tr className="bg-white/3 text-[11px] text-ink-2">
              <th className="border-y border-line-soft py-2.25 pl-5 pr-3 font-normal">Nome</th>
              <th className="border-y border-line-soft px-3 py-2.25 font-normal">Imóvel de interesse</th>
              <th className="border-y border-line-soft px-3 py-2.25 font-normal">Data</th>
              <th className="border-y border-line-soft px-3 py-2.25 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-7 text-center text-xs text-ink-3">
                  Nenhum lead recebido no período.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line-soft text-[11px] text-ink-2 last:border-0 hover:bg-white/3">
                  <td className="h-7.5 whitespace-nowrap py-1 pl-5 pr-3 text-ink">
                    <span className="flex items-center gap-2.5">
                      <Avatar name={lead.name} src={lead.avatarUrl} className="size-5.5 text-[9px]" />
                      {lead.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3">{lead.property}</td>
                  <td className="whitespace-nowrap px-3">{formatDateTime(lead.createdAt)}</td>
                  <td className="whitespace-nowrap px-3">
                    <span className={cn("inline-block rounded-full border px-3 py-px text-[10px]", STATUS[lead.status].className)}>
                      {STATUS[lead.status].label}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}