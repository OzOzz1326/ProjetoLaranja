/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { chaveEsporte, obterTemaEsporte } from "../esportes";

const TemaContext = createContext({
    tema: "tema-todos",
    temaInfo: obterTemaEsporte("todos"),
    setTemaManual: () => {},
});

export function TemaProvider({ children }) {
    const location = useLocation();

    const temaManual = useMemo(() => {
        if (!location.pathname.startsWith("/detalhes")) {
            return null;
        }

        try {
            return sessionStorage.getItem("temaManualEsporte");
        } catch {
            return null;
        }
    }, [location.pathname]);

    const chaveAtual = useMemo(() => {
        if (location.pathname === "/quadras") {
            const params = new URLSearchParams(location.search);
            const esporte = params.get("esporte");
            return esporte ? chaveEsporte(esporte) : "todos";
        }

        if (location.pathname.startsWith("/detalhes") && temaManual) {
            return chaveEsporte(temaManual);
        }

        return "todos";
    }, [location.pathname, location.search, temaManual]);

    const temaInfo = obterTemaEsporte(chaveAtual);
    const temaClasse = `tema-${temaInfo.tema}`;

    const setTemaManual = (valor) => {
        try {
            if (!valor) {
                sessionStorage.removeItem("temaManualEsporte");
                return;
            }

            sessionStorage.setItem("temaManualEsporte", String(valor));
        } catch {
            // Ignora falhas de armazenamento em ambientes sem sessão disponível.
        }
    };

    return (
        <TemaContext.Provider value={{ tema: temaClasse, temaInfo, setTemaManual }}>
            {children}
        </TemaContext.Provider>
    );
}

export function useTema() {
    return useContext(TemaContext);
}
