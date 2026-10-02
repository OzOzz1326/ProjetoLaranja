import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { chaveEsporte, obterTemaEsporte } from "../esportes";

const TemaContext = createContext({
    tema: "tema-todos",
    temaInfo: obterTemaEsporte("todos"),
    setTemaManual: () => {},
});

export function TemaProvider({ children }) {
    const location = useLocation();
    const [temaManual, setTemaManual] = useState(null);

    // Determina o tema com base na rota e nos query params
    const chaveAtual = (() => {
        // Se estiver em /quadras, segue a query string ?esporte=...
        if (location.pathname === "/quadras") {
            const params = new URLSearchParams(location.search);
            const esporte = params.get("esporte");
            if (esporte) {
                return chaveEsporte(esporte);
            }
            return "todos";
        }

        // Se estiver em /detalhes e houver tema definido pelo esporte da quadra
        if (location.pathname.startsWith("/detalhes") && temaManual) {
            return chaveEsporte(temaManual);
        }

        // Se houver tema manual ativo
        if (temaManual) {
            return chaveEsporte(temaManual);
        }

        return "todos";
    })();

    const temaInfo = obterTemaEsporte(chaveAtual);
    const temaClasse = `tema-${temaInfo.tema}`;

    // Reseta o tema manual quando o usuário sai da página de detalhes
    useEffect(() => {
        if (!location.pathname.startsWith("/detalhes")) {
            setTemaManual(null);
        }
    }, [location.pathname]);

    return (
        <TemaContext.Provider value={{ tema: temaClasse, temaInfo, setTemaManual }}>
            {children}
        </TemaContext.Provider>
    );
}

export function useTema() {
    return useContext(TemaContext);
}
