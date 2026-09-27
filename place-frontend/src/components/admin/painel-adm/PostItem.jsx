import { cn } from "@/lib/cn";
import { formaDate } from "@/lib/format";

const TAG_TONE = {
    danger: "border-danger/40 bg-danger/12 text-danger",
    gold: "border-gold/40 bg-gold/15 text-gold",
    info: "border-info/40 bg-info/12 text-info",
    ok: "border-ok/40 bg-ok/12 text-ok",
    neutral: "border-line ng-white/5 text-ink-2",
};

export function PostItem ({ title, description, date, tagLabel, tagTone = "neutral, author"}) {
    return ( 
        <li className = "rounded-lg border border-line-soft bg-white/3 p-3.5">
            <div className = "flex items-start justify-between gap-2">
                <h4 className= "text-[13px] font-medium">{title}</h4>
                {tagLabel && (
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px]", TAG_TONE[tagTone])}>
                        {tagLabel}
                    </span>
                )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-ink-3">
                <span>{author ?? " "}</span>
                <span>{formaDate(date)}</span>
            </div>
        </li>
    );
}