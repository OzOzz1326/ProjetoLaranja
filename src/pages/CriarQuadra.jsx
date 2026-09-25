import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./CriarQuadra.css";

const esportesDisponiveis = [
    { valor: "futebol", nome: "Futebol" },
    { valor: "futsal", nome: "Futsal" },
    { valor: "basquete", nome: "Basquete" },
    { valor: "volei", nome: "Vôlei" },
    
];

const diasDaSemana = [
    { valor: "segunda", nome: "Segunda-feira", coluna: "funcionamento_seg" },
    { valor: "terca", nome: "Terça-feira", coluna: "funcionamento_ter" },
    { valor: "quarta", nome: "Quarta-feira", coluna: "funcionamento_qua" },
    { valor: "quinta", nome: "Quinta-feira", coluna: "funcionamento_qui" },
    { valor: "sexta", nome: "Sexta-feira", coluna: "funcionamento_sex" },
    { valor: "sabado", nome: "Sábado", coluna: "funcionamento_sab" },
    { valor: "domingo", nome: "Domingo", coluna: "funcionamento_dom" },
];

const funcionamentoInicial = Object.fromEntries(
    diasDaSemana.map((dia) => [dia.valor, false])
);

function CriarQuadra() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [esporte, setEsporte] = useState("");
    const [descricao, setDescricao] = useState("");
    const [outros, setOutros] = useState("");
    const [preco, setPreco] = useState("");
    const [imagem, setImagem] = useState("");
    const [funcionamento, setFuncionamento] = useState(funcionamentoInicial);
    const [horarioInicio, setHorarioInicio] = useState("08:00");
    const [horarioFim, setHorarioFim] = useState("22:00");
    const [salvando, setSalvando] = useState(false);

    function atualizaFuncionamento(dia, aberto) {
        setFuncionamento((atual) => ({
            ...atual,
            [dia]: aberto,
        }));
    }

    async function cadastrarQuadra(evento) {
        evento.preventDefault();

        if (!supabase) {
            console.error("Não foi possível conectar ao Supabase. Confira as variáveis de ambiente.");
            window.alert("Não foi possível cadastrar a quadra. Verifique a conexão com o banco de dados.");
            return;
        }

        const temDiaAberto = Object.values(funcionamento).some(Boolean);

        if (!temDiaAberto) {
            console.warn("Cadastro da quadra cancelado: selecione pelo menos um dia de funcionamento.");
            window.alert("Selecione pelo menos um dia de funcionamento.");
            return;
        }

        if (horarioFim <= horarioInicio) {
            console.warn("Cadastro da quadra cancelado: o fechamento precisa ser depois da abertura.");
            window.alert("O horário de fechamento precisa ser depois do horário de abertura.");
            return;
        }

        setSalvando(true);

        try {
            const { data: sessao, error: erroSessao } = await supabase.auth.getUser();

            if (erroSessao || !sessao.user) {
                console.error("É necessário estar autenticado para cadastrar uma quadra:", erroSessao);
                window.alert("Faça login antes de cadastrar uma quadra.");
                navigate("/login");
                return;
            }

            const { data: usuario, error: erroUsuario } = await supabase
                .from("usuarios")
                .select("id")
                .eq("email", sessao.user.email)
                .maybeSingle();

            if (erroUsuario || !usuario) {
                console.error("Não foi possível localizar o perfil do proprietário:", erroUsuario);
                window.alert("Não foi possível localizar seu perfil de usuário. Entre novamente ou refaça o cadastro.");
                return;
            }

            const { error } = await supabase.from("quadras").insert({
                id_usuario: usuario.id,
                nome,
                tipo_jogo: esporte,
                descricao,
                preco: Number(preco),
                imagem: imagem || null,
                funcionamento_seg: funcionamento.segunda,
                funcionamento_ter: funcionamento.terca,
                funcionamento_qua: funcionamento.quarta,
                funcionamento_qui: funcionamento.quinta,
                funcionamento_sex: funcionamento.sexta,
                funcionamento_sab: funcionamento.sabado,
                funcionamento_dom: funcionamento.domingo,
                horario_inicio: horarioInicio,
                horario_fim: horarioFim,
                outros: outros.trim() || null,
            });

            if (error) {
                console.error("Não foi possível cadastrar a quadra no Supabase:", error);
                window.alert(`Não foi possível cadastrar a quadra: ${error.message}`);
                return;
            }

            window.alert("Quadra cadastrada com sucesso!");
            navigate("/quadras");
        } catch (error) {
            console.error("Erro inesperado ao cadastrar a quadra:", error);
            window.alert("Ocorreu um erro ao cadastrar a quadra. Confira o console do navegador.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main id="pagina-criar-quadra" className="pagina-criar-quadra">
            <header className="cabecalho-criar-quadra">
                <Link to="/quadras">Voltar para quadras</Link>
                <p className="etiqueta-criar-quadra">NOVA QUADRA</p>
                <h1>Cadastre sua quadra</h1>
                <p>Preencha os dados principais para divulgar seu espaço.</p>
            </header>

            <form className="formulario-quadra" onSubmit={cadastrarQuadra}>
                <label className="campo-quadra">
                    <span>Nome da quadra</span>
                    <input
                        value={nome}
                        onChange={(evento) => setNome(evento.target.value)}
                        placeholder="Ex.: Arena Central"
                        required
                    />
                </label>

                <label className="campo-quadra">
                    <span>Esporte</span>
                    <select value={esporte} onChange={(evento) => setEsporte(evento.target.value)} required>
                        <option value="">Selecione o esporte</option>
                        {esportesDisponiveis.map((opcao) => (
                            <option value={opcao.valor} key={opcao.valor}>{opcao.nome}</option>
                        ))}
                    </select>
                </label>

                <label className="campo-quadra">
                    <span>Descrição</span>
                    <textarea
                        value={descricao}
                        onChange={(evento) => setDescricao(evento.target.value)}
                        placeholder="Descreva sua quadra"
                        rows="4"
                        required
                    />
                </label>

                <label className="campo-quadra">
                    <span>Preço por hora (R$)</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={preco}
                        onChange={(evento) => setPreco(evento.target.value)}
                        placeholder="Ex.: 120,00"
                        required
                    />
                </label>

                <fieldset className="grupo-horarios-quadra">
                    <legend>Dias e horários de funcionamento</legend>
                    {diasDaSemana.map((dia) => (
                        <div className="linha-horario-quadra" key={dia.valor}>
                            <label className="seletor-dia-quadra">
                                <input
                                    type="checkbox"
                                    checked={funcionamento[dia.valor]}
                                    onChange={(evento) => atualizaFuncionamento(dia.valor, evento.target.checked)}
                                />
                                <span>{dia.nome}</span>
                            </label>
                            <span className="texto-fechado-quadra">
                                {funcionamento[dia.valor] ? "Aberto" : "Fechado"}
                            </span>
                        </div>
                    ))}
                    <div className="campos-horario-quadra">
                        <label>
                            <span>Abre</span>
                            <input
                                type="time"
                                value={horarioInicio}
                                onChange={(evento) => setHorarioInicio(evento.target.value)}
                                required
                            />
                        </label>
                        <label>
                            <span>Fecha</span>
                            <input
                                type="time"
                                value={horarioFim}
                                onChange={(evento) => setHorarioFim(evento.target.value)}
                                required
                            />
                        </label>
                    </div>
                </fieldset>

                <label className="campo-quadra">
                    <span>Outras coisas que a quadra oferece</span>
                    <textarea
                        value={outros}
                        onChange={(evento) => setOutros(evento.target.value)}
                        placeholder="Ex.: estacionamento, vestiário, churrasqueira"
                        rows="3"
                    />
                    <small>Separe os itens por vírgula ou linha.</small>
                </label>

                <label className="campo-quadra">
                    <span>Imagem (URL, opcional)</span>
                    <input
                        type="url"
                        value={imagem}
                        onChange={(evento) => setImagem(evento.target.value)}
                        placeholder="https://exemplo.com/quadra.jpg"
                    />
                </label>

                <button className="botao-criar-quadra" type="submit" disabled={salvando}>
                    {salvando ? "Cadastrando..." : "Cadastrar quadra"}
                </button>
            </form>
        </main>
    );
}

export default CriarQuadra;