import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { carregarPerfilUsuario, dadosBasicosUsuario, supabase } from '../supabase';
import { definirPagamentoTesteAtivo, lerPagamentoTesteAtivo, usuarioEhAdministrador } from '../configuracaoAdmin';
import { useTema } from '../context/TemaContext';
import './MenuSuperior.css';

function MenuSuperior() {
    const navigate = useNavigate();
    const location = useLocation();
    const [termoBusca, setTermoBusca] = useState("");
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [pagamentoTesteAtivo, setPagamentoTesteAtivo] = useState(lerPagamentoTesteAtivo);
    const estaNaHome = location.pathname === "/" || location.pathname === "/pagina-inicial";
    const [homeRolada, setHomeRolada] = useState(() => window.scrollY > 60);

    useEffect(() => {
        if (!estaNaHome) return undefined;

        const atualizarVisibilidade = () => setHomeRolada(window.scrollY > 60);
        const mostrarNavegacao = () => setHomeRolada(true);
        const quadro = window.requestAnimationFrame(atualizarVisibilidade);
        window.addEventListener("scroll", atualizarVisibilidade, { passive: true });
        window.addEventListener("sportincity:show-navigation", mostrarNavegacao);

        return () => {
            window.cancelAnimationFrame(quadro);
            window.removeEventListener("scroll", atualizarVisibilidade);
            window.removeEventListener("sportincity:show-navigation", mostrarNavegacao);
        };
    }, [estaNaHome]);

    useEffect(() => {
        let ativo = true;

        function atualizarUsuario(session) {
            if (!session?.user) {
                localStorage.removeItem("usuario");
                setUsuarioLogado(null);
                return;
            }

            const dadosBasicos = dadosBasicosUsuario(session.user);
            localStorage.setItem("usuario", JSON.stringify(dadosBasicos));

            carregarPerfilUsuario(session.user)
                .then((dados) => {
                    if (!ativo) return;
                    setUsuarioLogado(dados);
                    localStorage.setItem("usuario", JSON.stringify(dados));
                })
                .catch((error) => {
                    console.error("Erro ao carregar o perfil do menu:", error);
                });
        }

        if (!supabase) {
            localStorage.removeItem("usuario");
            return;
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            queueMicrotask(() => atualizarUsuario(session));
        });

        supabase.auth.getSession().then(({ data, error }) => {
            if (!ativo) return;
            if (error) {
                console.error("Erro ao recuperar a sessão do menu:", error);
                atualizarUsuario(null);
                return;
            }
            atualizarUsuario(data.session);
        });

        return () => {
            ativo = false;
            listener?.subscription?.unsubscribe();
        };
    }, []);

    function realizarBusca(evento) {
        evento.preventDefault();
        const termo = termoBusca.trim();

        if (termo) {
            navigate(`/quadras?busca=${encodeURIComponent(termo)}`);
            return;
        }

        navigate('/quadras');
    }

    function alterarPagamentoTeste(evento) {
        const ativo = evento.target.checked;
        definirPagamentoTesteAtivo(ativo);
        setPagamentoTesteAtivo(ativo);
    }

    const { tema } = useTema();

    return (
        <header className={`navbar-container ${tema}${estaNaHome ? " navbar-container-home" : ""}${estaNaHome && !homeRolada ? " navbar-container-home-oculta" : ""}`}>
            <nav className="navbar">
                <div className="logo-container">
                    <Link to="/pagina-inicial" aria-label="Ir para a página inicial">
                        <img src="/sportincitylogo.png" alt="SportInCity Logo" />
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><NavLink to="/pagina-inicial">Início</NavLink></li>
                    <li><NavLink to="/quadras">Quadras</NavLink></li>
                    <li><NavLink to="/contato">Contato</NavLink></li>
                </ul>

                <div className="nav-actions">
                    {usuarioEhAdministrador(usuarioLogado?.email) && (
                        <label className="controle-pagamento-teste">
                            <input
                                type="checkbox"
                                checked={pagamentoTesteAtivo}
                                onChange={alterarPagamentoTeste}
                                disabled={import.meta.env.VITE_PAGAMENTO_TESTE_ATIVO === "false"}
                            />
                            <span>Pagamento de teste</span>
                        </label>
                    )}
                    <form className="search-container" onSubmit={realizarBusca}>
                        <input
                            type="text"
                            placeholder="Pesquise..."
                            className="search-input"
                            id="busca"
                            value={termoBusca}
                            onChange={(evento) => setTermoBusca(evento.target.value)}
                        />
                        <button type="submit" className="search-btn" aria-label="Buscar"></button>
                    </form>

                    {usuarioLogado ? (
                        <Link to="/perfil" className="avatar-usuario-btn" title={`Perfil de ${usuarioLogado.nome || usuarioLogado.email}`}>
                            <div className="circulo-avatar">
                                            {usuarioLogado.avatar_url ? (
                                                <img src={usuarioLogado.avatar_url} alt="" />
                                            ) : (
                                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                                </svg>
                                            )}
                            </div>
                            <span className="nome-usuario-nav">
                                {usuarioLogado.nome ? usuarioLogado.nome.split(" ")[0] : "Perfil"}
                            </span>
                        </Link>
                    ) : (
                        <Link to="/login" className="avatar-usuario-btn" title="Fazer login">
                            <div className="circulo-avatar deslogado">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>
                            <span className="nome-usuario-nav">Login</span>
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default MenuSuperior;
