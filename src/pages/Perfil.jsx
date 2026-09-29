import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { carregarPerfilUsuario, dadosBasicosUsuario, supabase } from "../supabase";
import "./Perfil.css";

function Perfil() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [editando, setEditando] = useState(false);
    const [nomeEditado, setNomeEditado] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function carregarUsuario() {
            if (!supabase) {
                setCarregando(false);
                return;
            }

            try {
                const { data, error } = await supabase.auth.getUser();

                if (error) throw error;

                if (!data.user) {
                    localStorage.removeItem("usuario");
                    return;
                }

                let dados;
                try {
                    dados = await carregarPerfilUsuario(data.user);
                } catch (erroPerfil) {
                    console.error("Erro ao buscar perfil adicional:", erroPerfil);
                    dados = dadosBasicosUsuario(data.user);
                }

                localStorage.setItem("usuario", JSON.stringify(dados));
                if (ativo) {
                    setUsuario(dados);
                    setNomeEditado(dados.nome || "");
                }
            } catch (error) {
                console.error("Erro ao carregar sessão do usuário:", error);
                localStorage.removeItem("usuario");
                if (ativo) setUsuario(null);
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarUsuario();

        return () => {
            ativo = false;
        };
    }, []);

    async function salvarEdicaoNome() {
        if (!nomeEditado.trim()) {
            alert("O nome não pode ficar em branco.");
            return;
        }

        if (!supabase || !usuario?.email) {
            alert("Não foi possível conectar ao Supabase para atualizar o perfil.");
            return;
        }

        setSalvando(true);
        try {
            const { data: perfilAtualizado, error: erroPerfil } = await supabase
                .from("usuarios")
                .update({ nome: nomeEditado.trim() })
                .eq("email", usuario.email)
                .select("id")
                .maybeSingle();

            if (erroPerfil) throw erroPerfil;
            if (!perfilAtualizado) {
                throw new Error("Perfil não encontrado na tabela usuarios.");
            }

            const { error: erroAuth } = await supabase.auth.updateUser({
                data: { nome: nomeEditado.trim() },
            });

            const novoUsuario = { ...usuario, nome: nomeEditado.trim() };
            localStorage.setItem("usuario", JSON.stringify(novoUsuario));
            setUsuario(novoUsuario);
            setEditando(false);

            if (erroAuth) {
                console.error("Erro ao atualizar o nome nos dados do Auth:", erroAuth);
                alert("Nome atualizado no perfil, mas não foi possível sincronizar os dados da conta.");
            } else {
                alert("Nome atualizado com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao atualizar nome:", error);
            alert(`Erro ao atualizar o nome: ${error.message || "verifique a conexão com o banco."}`);
        } finally {
            setSalvando(false);
        }
    }

    async function fazerLogout() {
        const confirmar = window.confirm("Deseja realmente sair da sua conta?");
        if (!confirmar) return;

        try {
            if (!supabase) throw new Error("Não foi possível conectar ao Supabase.");

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            localStorage.removeItem("usuario");
            alert("Você saiu da sua conta.");
            navigate("/login");
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            alert(`Não foi possível encerrar a sessão: ${error.message}`);
        }
    }

    if (carregando) {
        return (
            <main id="pagina-perfil" className="pagina-perfil">
                <div className="card-sem-sessao">
                    <h2>Carregando perfil...</h2>
                </div>
            </main>
        );
    }

    if (!usuario) {
        return (
            <main id="pagina-perfil" className="pagina-perfil">
                <div className="card-sem-sessao">
                    <h2>Você não está conectado</h2>
                    <p>Faça login ou cadastre-se para acessar o seu perfil no SportInCity.</p>
                    <div className="botoes-sem-sessao">
                        <Link to="/login" className="btn-ir-login">Fazer Login</Link>
                        <Link to="/cadastro" className="btn-ir-cadastro">Cadastre-se</Link>
                    </div>
                </div>
            </main>
        );
    }

    const iniciais = (usuario.nome || usuario.email || "SC")
        .split(" ")
        .map((parte) => parte[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <main id="pagina-perfil" className="pagina-perfil">
            <div className="container-perfil">
                {/* Lado Esquerdo / Principal: Foto, Nome e Próxima Partida (Conforme protótipo Página 13) */}
                <section className="painel-principal-perfil">
                    <div className="cabecalho-usuario">
                        <div className="foto-perfil">
                            <span>{iniciais}</span>
                        </div>

                        <div className="info-nome-usuario">
                            {editando ? (
                                <div className="bloco-editar-nome">
                                    <input
                                        type="text"
                                        value={nomeEditado}
                                        onChange={(e) => setNomeEditado(e.target.value)}
                                        placeholder="Seu nome completo"
                                    />
                                    <button onClick={salvarEdicaoNome} disabled={salvando}>
                                        {salvando ? "Salvando..." : "Salvar"}
                                    </button>
                                    <button type="button" onClick={() => setEditando(false)} className="btn-cancelar">
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <div className="linha-nome">
                                    <h1>{usuario.nome || "Usuário"}</h1>
                                    <button
                                        type="button"
                                        className="btn-icone-editar"
                                        onClick={() => setEditando(true)}
                                        title="Editar nome"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                            <p className="subtitulo-perfil">Membro SportInCity</p>
                        </div>
                    </div>

                    {/* Card de Próxima Partida conforme Página 13 do protótipo */}
                    <div className="card-proxima-partida">
                        <div className="logo-partida">
                            <img src="/logosfundo.png" alt="SportInCity" />
                        </div>
                        <div className="detalhes-partida">
                            <h2>Próxima Partida</h2>
                            <p className="item-partida">
                                <span className="check-verde">☑</span> Segunda-Feira
                            </p>
                            <p className="item-partida">
                                <span className="check-verde">☑</span> 19:00 Horas
                            </p>
                        </div>
                    </div>

                    {/* Botão de Logout no canto inferior esquerdo como na página 13 */}
                    <div className="rodape-acoes-perfil">
                        <button type="button" className="btn-logout" onClick={fazerLogout}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3H10c-1.1 0-2 .9-2 2v4h2V5h10v14H10v-4H8v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </section>

                {/* Lado Direito: Informações da Conta e Ações Rápidas */}
                <section className="painel-lateral-perfil">
                    <div className="card-dados-conta">
                        <h3>Dados da Conta</h3>
                        <div className="item-dado">
                            <strong>E-mail:</strong>
                            <span>{usuario.email}</span>
                        </div>
                        {usuario.data_nascimento && (
                            <div className="item-dado">
                                <strong>Nascimento:</strong>
                                <span>{usuario.data_nascimento}</span>
                            </div>
                        )}
                        <div className="item-dado">
                            <strong>Status:</strong>
                            <span className="status-ativo">Conta Ativa</span>
                        </div>
                    </div>

                    <div className="card-atalhos-perfil">
                        <h3>Acesso Rápido</h3>
                        <Link to="/quadras" className="btn-atalho">Ver Quadras Disponíveis →</Link>
                        <Link to="/cadastrar-quadra" className="btn-atalho">Cadastrar Nova Quadra →</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Perfil;
