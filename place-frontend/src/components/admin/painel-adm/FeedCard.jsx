import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PostItem } from "@/components/admin/painel-adm/PostItem";

// Mostra os primeiros itens; o resto fica atrás de "Ver todos" para as colunas do painel não ficarem
// desiguais (a lista de segurança crescia sem limite e deixava as outras duas com espaço vazio).
const INICIAIS = 4;

export function FeedCard ({title, description, icon, feed, emptyLabel}) {
    const {data, loading, error } = feed;
    const [todos, setTodos] = useState(false);
    const itens = todos ? data ?? [] : (data ?? []).slice(0, INICIAIS);
    const escondidos = (data?.length ?? 0) - INICIAIS;

    return (
        <Card className="flex flex-col">
            <CardHeader title={title} description={description} action={<Icon name={icon} className= "text-gold" />} />
            {loading && <p className= "text-xs text-ink-2"> Carregando...</p>}
            {error && <p className="text-xs text-danger"> Não foi possível carregar.</p>}
            {!loading && !error && data?.length === 0 && <EmptyState>{emptyLabel}</EmptyState>}
            {!loading && !error && data?.length > 0 && (
                <ul className="flex flex-col gap-2.5">
                    {itens.map((item) => <PostItem key={item.id} {...item} />)}
                </ul>
            )}
            {!loading && !error && escondidos > 0 && (
                <button type="button" onClick={() => setTodos((v) => !v)} aria-expanded={todos}
                    className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl text-[13px] text-gold hover:underline">
                    {todos ? "Mostrar menos" : `Ver todos (${data.length})`}
                </button>
            )}
        </Card>
    );
}
