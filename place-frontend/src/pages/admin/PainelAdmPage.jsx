import { useOutletContext } from "react-router-dom";
import { DashboardAcesso } from "@/components/admin/painel-adm/DashboardAcesso";
import { ResumoOperacional } from "@/components/admin/painel-adm/ResumoOperacional";
import { FeedCard } from "@/components/admin/painel-adm/FeedCard";
import { useAsyncData} from "@/hooks/useAsyncData";
import { usePageTitle} from "@/hooks/usePageTitle";
import { getAvisosSeguranca } from "@/services/painel";
import { listarEmpreendimentos } from "@/services/empreendimentos";
import { criarFeedsDoCatalogo } from "@/components/admin/painel-adm/catalogoFeeds";

export default function PainelAdmPage (){
    usePageTitle("Painel Administrativo");

    const { user } = useOutletContext();
    const alerts = useAsyncData(getAvisosSeguranca);
    const catalogo = useAsyncData(listarEmpreendimentos);
    const { pendencias, atualizacoes } = criarFeedsDoCatalogo(catalogo);

    return (
        <div className="pb-painel-animado flex flex-col gap-6">
        <div>
            <p className="pb-eyebrow">Painel administrativo</p>
            <h1 className="text-[22px] font-medium tracking-tight sm:text-[26px]">Olá, {user.name.split(" ")[0]}</h1>
            <p className="mt-0.5 text-sm text-ink-2"> Acompanhe o que precisa da sua atenção no painel.</p>
            </div>

            <ResumoOperacional/>

            <DashboardAcesso/>

            <section className="grid gap-4 lg:grid-cols-3">
                <FeedCard title="Registros de Segurança" description="Ocorrências cadastradas; não representa monitoramento automático" icon="bell" feed={alerts} emptyLabel="Nenhum registro cadastrado. Isso não garante ausência de incidentes." />
                <FeedCard title="Pendências dos Imóveis" description="Itens faltantes em empreendimentos publicados" icon="activity" feed={pendencias} emptyLabel="Nenhuma pendência identificada nos imóveis publicados." />
                <FeedCard title="Cadastros Atualizados" description="Últimas alterações cadastrais; não é histórico de auditoria" icon="refresh" feed={atualizacoes} emptyLabel="Nenhum cadastro atualizado encontrado." />
            </section>
        </div>
    );
}