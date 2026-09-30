import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { carregarPerfilUsuario, dadosBasicosUsuario, supabase } from "../supabase";
import "./Perfil.css";

function converterHorarioEmMinutos(horario) {
    const [hora, minuto] = String(horario || "").split(":").map(Number);
    return hora * 60 + minuto;
}

function formatarMinutosEmHorario(minutos) {
    const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
    const minuto = String(minutos % 60).padStart(2, "0");
    return `${hora}:${minuto}`;
}

async function buscarProximaReserva(idUsuario) {
    const agora = new Date();
    const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
    const { data: reservas, error } = await supabase
        .from("reservas")
        .select("id,grupo_reserva,dia_reserva,horaio,id_quadra")
        .eq("id_usuario", idUsuario)
        .gte("dia_reserva", dataHoje)
        .order("dia_reserva", { ascending: true })
        .order("horaio", { ascending: true });

    if (error) throw error;

    const reserva = (reservas || []).find((item) => (
        item.dia_reserva > dataHoje || item.horaio >= horaAtual
    ));

    if (!reserva?.id_quadra) return reserva || null;

    let horariosReserva = [String(reserva.horaio).slice(0, 5)];
    if (reserva.grupo_reserva) {
        const { data: grupo, error: erroGrupo } = await supabase
            .from("reservas")
            .select("horaio")
            .eq("grupo_reserva", reserva.grupo_reserva)
            .order("horaio", { ascending: true });

        if (erroGrupo) throw erroGrupo;
        horariosReserva = (grupo || []).map((item) => String(item.horaio).slice(0, 5));
    }

    const horarioInicio = horariosReserva[0];
    const horarioFim = formatarMinutosEmHorario(converterHorarioEmMinutos(horariosReserva.at(-1)) + 60);

    const { data: quadra, error: erroQuadra } = await supabase
        .from("quadras")
        .select("nome,tipo_jogo,imagem")
        .eq("id", reserva.id_quadra)
        .maybeSingle();

    if (erroQuadra) throw erroQuadra;

    return { ...reserva, horarioInicio, horarioFim, quadra };
}

function Perfil() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [editando, setEditando] = useState(false);
    const [nomeEditado, setNomeEditado] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [proximaReserva, setProximaReserva] = useState(null);
    const [cancelandoReserva, setCancelandoReserva] = useState(false);
    const [erroReserva, setErroReserva] = useState(false);
    const [atualizandoFoto, setAtualizandoFoto] = useState(false);
    const inputFotoRef = useRef(null);

    useEffect(() => {
        let ativo = true;

        async function carregarUsuario() {
            if (!supabase) {
                setCarregando(false);
                return;
            }

            try {
                const { data, error } = await supabase.auth.getUser();
                if (error?.name === "AuthSessionMissingError") {
                    localStorage.removeItem("usuario");
                    if (ativo) setUsuario(null);
                    return;
                }
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

                if (dados.perfil_id) {
                    try {
                        const reserva = await buscarProximaReserva(dados.perfil_id);
                        if (ativo) setProximaReserva(reserva);
                    } catch (erroReserva) {
                        console.error("Erro ao carregar próxima reserva:", erroReserva);
                        if (ativo) setErroReserva(true);
                    }
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

    async function cancelarReserva() {
        if (!proximaReserva?.id || !usuario?.perfil_id) return;

        const confirmar = window.confirm("Deseja cancelar esta reserva? O horário ficará disponível para outras pessoas.");
        if (!confirmar) return;

        setCancelandoReserva(true);
        try {
            let consultaExclusao = supabase
                .from("reservas")
                .delete()
                .eq("id_usuario", usuario.perfil_id);

            consultaExclusao = proximaReserva.grupo_reserva
                ? consultaExclusao.eq("grupo_reserva", proximaReserva.grupo_reserva)
                : consultaExclusao.eq("id", proximaReserva.id);

            const { error } = await consultaExclusao;

            if (error) throw error;

            setProximaReserva(null);
        } catch (error) {
            console.error("Erro ao cancelar reserva:", error);
            alert(`Não foi possível cancelar a reserva: ${error.message || "verifique a conexão com o banco."}`);
        } finally {
            setCancelandoReserva(false);
        }
    }

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
            }
        } catch (error) {
            console.error("Erro ao atualizar nome:", error);
            alert(`Erro ao atualizar o nome: ${error.message || "verifique a conexão com o banco."}`);
        } finally {
            setSalvando(false);
        }
    }

    async function trocarFoto(evento) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = "";

        if (!arquivo) return;

        const extensoes = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        };

        if (!extensoes[arquivo.type]) {
            alert("Escolha uma imagem JPG, PNG ou WebP.");
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 5 MB.");
            return;
        }

        setAtualizandoFoto(true);
        let caminhoImagem;

        try {
            const { data: sessao, error: erroSessao } = await supabase.auth.getUser();
            if (erroSessao) throw erroSessao;
            if (!sessao.user) throw new Error("Entre novamente para trocar sua foto.");

            caminhoImagem = `${sessao.user.id}/perfil-${Date.now()}.${extensoes[arquivo.type]}`;
            const { error: erroUpload } = await supabase.storage
                .from("avatars")
                .upload(caminhoImagem, arquivo, {
                    cacheControl: "3600",
                    contentType: arquivo.type,
                    upsert: false,
                });

            if (erroUpload) throw erroUpload;

            const { data: arquivoPublico } = supabase.storage.from("avatars").getPublicUrl(caminhoImagem);
            const avatarUrl = `${arquivoPublico.publicUrl}?v=${Date.now()}`;
            const { data, error: erroAuth } = await supabase.auth.updateUser({
                data: { avatar_url: avatarUrl },
            });

            if (erroAuth) {
                await supabase.storage.from("avatars").remove([caminhoImagem]);
                throw erroAuth;
            }

            const novoUsuario = { ...usuario, avatar_url: data.user.user_metadata.avatar_url };
            localStorage.setItem("usuario", JSON.stringify(novoUsuario));
            setUsuario(novoUsuario);
        } catch (error) {
            console.error("Erro ao atualizar foto do perfil:", error);
            alert(`Não foi possível atualizar a foto: ${error.message || "verifique a configuração do Storage."}`);
        } finally {
            setAtualizandoFoto(false);
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
                        <div className="area-foto-perfil">
                            <div className="foto-perfil">
                                {usuario.avatar_url ? (
                                    <img src={usuario.avatar_url} alt={`Foto de perfil de ${usuario.nome}`} />
                                ) : (
                                    <span>{iniciais}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn-trocar-foto"
                                onClick={() => inputFotoRef.current?.click()}
                                disabled={atualizandoFoto}
                            >
                                {atualizandoFoto ? "Enviando..." : "Trocar foto"}
                            </button>
                            <input
                                ref={inputFotoRef}
                                className="input-foto-perfil"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={trocarFoto}
                            />
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

                    {/* Próxima reserva futura deste usuário */}
                    <div className="card-proxima-partida">
                        <div className="foto-quadra-partida">
                            {proximaReserva?.quadra && (
                                <img
                                    src={proximaReserva.quadra.imagem || "/quadracontato.jpg"}
                                    alt={`Foto da quadra ${proximaReserva.quadra.nome}`}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(evento) => {
                                        evento.currentTarget.onerror = null;
                                        evento.currentTarget.src = "/quadracontato.jpg";
                                    }}
                                />
                            )}
                        </div>
                        <div className="detalhes-partida">
                            <h2>Próxima reserva</h2>
                            {erroReserva ? (
                                <p className="item-partida">Não foi possível carregar suas reservas.</p>
                            ) : proximaReserva ? (
                                <>
                                    <p className="item-partida">
                                        {proximaReserva.dia_reserva.split("-").reverse().join("/")} · {proximaReserva.horarioInicio} às {proximaReserva.horarioFim}
                                    </p>
                                    {proximaReserva.quadra && (
                                        <p className="item-partida">
                                            {proximaReserva.quadra.nome} · {proximaReserva.quadra.tipo_jogo}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-cancelar-reserva"
                                        onClick={cancelarReserva}
                                        disabled={cancelandoReserva}
                                    >
                                        {cancelandoReserva ? "Cancelando..." : "Cancelar reserva"}
                                    </button>
                                </>
                            ) : (
                                <p className="item-partida">Você não tem reservas futuras.</p>
                            )}
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
