import { useOutletContext } from "react-router-dom";
import { DashboardAcessCard } from "@/components/admin/painel-adm/DashboardAcesso";
import { FeedCard } from "@/components/admin/painel-adm/FeedCard";
import { useAsyncData} from "@/hooks/useAsyncData";
import { usePageTitle} from "@/hooks/usePageTitle";
import { getAvisosSeguranca, getMelhorias, getModificacoes } from "@/services/painel";

export default function PainelAdmPage (){
    usePageTitle("Painel Administrativo");

    const { user } = useOutletContext();
    const alerts = useAsyncData(getAvisosSeguranca);
    const improvments = useAsyncData(getMelhorias);
    const changes = useAsyncData(getModificacoes);

    return (
        <>
        <div>
            <h1 className="text-[22px] font-medium tracking-tight sm:text-[26px]">Olá, {user.name.split(" ")[0]}! 👋</h1>
            <p className="mt-0.5 text-sm text-ink-2"> Acompanhe o que precisa da sua atenção no painel.</p>
            </div>

            <DashboardAcessCard/>

            <section className="grid gap-4 lg:grid-cols-3">
                <FeedCard title="Avisos de Segurança" description="Alertas que precisam da sua atenção" icon="bell" feed={alerts} emptyLabel="Nenhum aviso no momento." />
                <FeedCard title="O que Pode Melhorar" description="Sugestões de melhoria para o site" icon="activity" feed={improvments} emptyLabel="Nenhuma sugestão registrada." />
                <FeedCard title="Modificações no Site" description="Últimas alterações publicadas" icon="refresh" feed={changes} emptyLabel="Nenhuma modificação recente." />
            </section>
        </>
    );
}