import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AcessoNegadoPage () {
    usePageTitle ("Acesso negado");
    return (
        <div className = "grid min-h-screen place-items-center px-4 text-center">
            <div>
                <h1 className="text-xl font-medium"> Acesso negado</h1>
                <p className="mt-2 text-sm text-ink-2">
                    Sua conta não tem permisssão para acessar o painel administrativo.
                </p>
                <Link to="/" className= "mt-4 inline-block text-sm text-gold hover:underline">
                    voltar para o início
                </Link>
            </div>
        </div>
    );
}