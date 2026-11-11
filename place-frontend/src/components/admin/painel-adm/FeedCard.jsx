import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PostItem } from "@/components/admin/painel-adm/PostItem";

export function FeedCard ({title, description, icon, feed, emptyLabel}) {
    const {data, loading, error } = feed;

    return (
        <Card>
            <CardHeader title={title} description={description} action={<Icon name={icon} className= "text-gold" />} />
            {loading && <p className= "text-xs text-ink-2"> Carregando...</p>}
            {error && <p className="text-xs text-danger"> Não foi possível carregar.</p>}
            {!loading && !error && data?.length === 0 && <EmptyState>{emptyLabel}</EmptyState>}
            {!loading && !error && data?.length > 0 && (
                <ul className="flex flex-col gap-2.5">
                    {data.map((item) => <PostItem key={item.id} {...item} />)}
                </ul>
            )}
        </Card>
    );
}
