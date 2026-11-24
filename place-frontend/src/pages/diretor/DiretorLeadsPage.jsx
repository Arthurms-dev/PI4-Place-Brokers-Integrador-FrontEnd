import { usePageTitle } from "@/hooks/usePageTitle";
import { LeadsDoTime } from "@/pages/gerente/GerenteLeadsPage";
import { repassarLeadDiretoria } from "@/services/diretor";
import { useDadosDiretoria } from "./useDadosDiretoria";

export default function DiretorLeadsPage() {
  usePageTitle("Leads da diretoria");
  const dados = useDadosDiretoria();
  return (
    <LeadsDoTime
      {...dados}
      escopo="diretoria"
      reatribuir={repassarLeadDiretoria}
      titulo={dados.diretoria ? `Leads · ${dados.diretoria.nome}` : "Leads da diretoria"}
      descricao={(n) => `${n} ${n === 1 ? "lead" : "leads"} com os corretores das suas equipes. Se o corretor não atender, passe o lead para outro da diretoria.`}
    />
  );
}
