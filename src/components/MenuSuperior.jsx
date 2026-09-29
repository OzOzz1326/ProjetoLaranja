import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carregarPerfilUsuario, dadosBasicosUsuario, supabase } from '../supabase';
import './MenuSuperior.css';

function MenuSuperior() {
    const navigate = useNavigate();
    const [termoBusca, setTermoBusca] = useState("");
    const [usuarioLogado, setUsuarioLogado] = useState(null);

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

    return (
        <header className="navbar-container">
            <nav className="navbar">
                <div className="logo-container">
                    <Link to="/pagina-inicial" aria-label="Ir para a página inicial">
                        <img src="/logosfundo.png" alt="SportInCity Logo" />
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><Link to="/pagina-inicial">Início</Link></li>
                    <li><Link to="/quadras">Quadras</Link></li>
                    <li><Link to="/contato">Contato</Link></li>
                </ul>

                <div className="nav-actions">
                    <form className="search-container" onSubmit={realizarBusca}>
                        <input
                            type="text"
                            placeholder="Pesquise..."
                            className="search-input"
                            id="busca"
                            value={termoBusca}
                            onChange={(evento) => setTermoBusca(evento.target.value)}
                        />
                        <button type="submit" className="search-btn" aria-label="Buscar">🔍</button>
                    </form>

                    {usuarioLogado ? (
                        <Link to="/perfil" className="avatar-usuario-btn" title={`Perfil de ${usuarioLogado.nome || usuarioLogado.email}`}>
                            <div className="circulo-avatar">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
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
