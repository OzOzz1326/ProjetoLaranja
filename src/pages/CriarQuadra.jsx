import { useState } from "react";
import { supabase } from "../supabase";
import "./CriarQuadra.css";

const esportesDisponiveis = [
    { valor: "futebol", nome: "Futebol" },
    { valor: "futvolei", nome: "Futvôlei" },
    { valor: "tenis", nome: "Tênis" },
    { valor: "beachtenis", nome: "Beach tênis" },
];

const diasDaSemana = [
    { valor: "segunda", nome: "Segunda-feira" },
    { valor: "terca", nome: "Terça-feira" },
    { valor: "quarta", nome: "Quarta-feira" },
    { valor: "quinta", nome: "Quinta-feira" },
    { valor: "sexta", nome: "Sexta-feira" },
    { valor: "sabado", nome: "Sábado" },
    { valor: "domingo", nome: "Domingo" },
];

const comodidadesDisponiveis = [
    "Churrasqueira",
    "Vestiários",
    "Estacionamento",
    "Iluminação",
    "Bebedouro",
    "Lanchonete",
    "Acessibilidade",
];

const horarioInicial = Object.fromEntries(
    diasDaSemana.map((dia) => [dia.valor, { aberto: true, inicio: "08:00", fim: "22:00" }])
);

function CriarQuadra() {
    const [nome, setNome] = useState("");
    const [cep, setCep] = useState("");
    const [endereco, setEndereco] = useState(null);
    const [carregandoCep, setCarregandoCep] = useState(false);
    const [erroCep, setErroCep] = useState("");
    const [descricao, setDescricao] = useState("");
    const [cobertura, setCobertura] = useState("");
    const [precoHora, setPrecoHora] = useState("");
    const [esportes, setEsportes] = useState([]);
    const [comodidades, setComodidades] = useState([]);
    const [outros, setOutros] = useState("");
    const [funcionamento, setFuncionamento] = useState(horarioInicial);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    async function buscaEndereco(valorCep) {
        const cepLimpo = valorCep.replace(/\D/g, "");

        setEndereco(null);
        setErroCep("");

        if (cepLimpo.length !== 8) {
            setErroCep("Digite um CEP válido com 8 números.");
            return;
        }

        setCarregandoCep(true);

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const dados = await resposta.json();

            if (!resposta.ok || dados.erro) {
                setErroCep("Não encontramos esse CEP. Confira os números e tente novamente.");
                return;
            }

            setEndereco({
                logradouro: dados.logradouro || "",
                bairro: dados.bairro || "",
                cidade: dados.localidade || "",
                uf: dados.uf || "",
            });
        } catch {
            setErroCep("Não foi possível consultar o CEP agora. Tente novamente.");
        } finally {
            setCarregandoCep(false);
        }
    }

    function alternaEsporte(valor) {
        setEsportes((atuais) =>
            atuais.includes(valor)
                ? atuais.filter((esporte) => esporte !== valor)
                : [...atuais, valor]
        );
    }

    function alternaComodidade(valor) {
        setComodidades((atuais) =>
            atuais.includes(valor)
                ? atuais.filter((comodidade) => comodidade !== valor)
                : [...atuais, valor]
        );
    }

    function atualizaDia(dia, campo, valor) {
        setFuncionamento((atual) => ({
            ...atual,
            [dia]: { ...atual[dia], [campo]: valor },
        }));
    }

    async function criarQuadra(evento) {
        evento.preventDefault();
        setMensagem(null);

        if (!supabase) {
            setMensagem({ tipo: "erro", texto: "Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para salvar a quadra." });
            return;
        }

        if (!endereco) {
            setMensagem({ tipo: "erro", texto: "Consulte um CEP válido antes de cadastrar." });
            return;
        }

        if (esportes.length === 0) {
            setMensagem({ tipo: "erro", texto: "Selecione pelo menos um esporte." });
            return;
        }

        const diasAbertos = Object.values(funcionamento).filter((dia) => dia.aberto);

        if (diasAbertos.length === 0) {
            setMensagem({ tipo: "erro", texto: "Selecione pelo menos um dia de funcionamento." });
            return;
        }

        if (diasAbertos.some((dia) => dia.fim <= dia.inicio)) {
            setMensagem({ tipo: "erro", texto: "Em cada dia aberto, o horário de fim deve ser depois do início." });
            return;
        }

        const listaComodidades = [
            ...comodidades,
            ...outros.split(",").map((item) => item.trim()).filter(Boolean),
        ];

        setSalvando(true);

        const { error } = await supabase.from("quadras").insert({
            nome,
            cep: cep.replace(/\D/g, ""),
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            uf: endereco.uf,
            descricao,
            cobertura,
            preco_hora: Number(precoHora),
            esportes,
            comodidades: listaComodidades,
            funcionamento,
        });

        setSalvando(false);

        if (error) {
            setMensagem({ tipo: "erro", texto: `Não foi possível cadastrar a quadra: ${error.message}` });
            return;
        }

        setMensagem({ tipo: "sucesso", texto: "Quadra cadastrada com sucesso!" });
        setNome("");
        setCep("");
        setEndereco(null);
        setDescricao("");
        setCobertura("");
        setPrecoHora("");
        setEsportes([]);
        setComodidades([]);
        setOutros("");
        setFuncionamento(horarioInicial);
    }

    return (
        <main id="pagina-criar-quadra" className="pagina-criar-quadra">
            <header className="cabecalho-criar-quadra">
                <p className="etiqueta-criar-quadra">NOVO ESPAÇO</p>
                <h1>Cadastre sua quadra</h1>
                <p>Preencha os dados para apresentar seu espaço a quem quer jogar.</p>
            </header>

            <form className="formulario-quadra" onSubmit={criarQuadra}>
                <section className="secao-formulario-quadra" aria-labelledby="titulo-dados-quadra">
                    <div className="titulo-secao-quadra">
                        <span>01</span>
                        <div>
                            <h2 id="titulo-dados-quadra">Sobre a quadra</h2>
                            <p>As informações principais do seu espaço.</p>
                        </div>
                    </div>

                    <label className="campo-quadra">
                        <span>Nome da quadra</span>
                        <input
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Ex.: Arena Central"
                            required
                        />
                    </label>

                    <fieldset className="grupo-opcoes-quadra">
                        <legend>Quais esportes podem ser praticados?</legend>
                        <div className="opcoes-quadra">
                            {esportesDisponiveis.map((esporte) => (
                                <label className="opcao-quadra" key={esporte.valor}>
                                    <input
                                        type="checkbox"
                                        checked={esportes.includes(esporte.valor)}
                                        onChange={() => alternaEsporte(esporte.valor)}
                                    />
                                    <span>{esporte.nome}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="grade-campos-quadra">
                        <label className="campo-quadra">
                            <span>Tipo de cobertura</span>
                            <select value={cobertura} onChange={(evento) => setCobertura(evento.target.value)} required>
                                <option value="">Selecione</option>
                                <option value="aberta">Aberta</option>
                                <option value="fechada">Fechada</option>
                            </select>
                        </label>
                        <label className="campo-quadra">
                            <span>Preço por hora (R$)</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={precoHora}
                                onChange={(evento) => setPrecoHora(evento.target.value)}
                                placeholder="Ex.: 120,00"
                                required
                            />
                        </label>
                    </div>

                    <label className="campo-quadra">
                        <span>Descrição</span>
                        <textarea
                            rows="4"
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder="Conte um pouco sobre a quadra e o espaço."
                            required
                        />
                    </label>
                </section>

                <section className="secao-formulario-quadra" aria-labelledby="titulo-endereco-quadra">
                    <div className="titulo-secao-quadra">
                        <span>02</span>
                        <div>
                            <h2 id="titulo-endereco-quadra">Onde fica</h2>
                            <p>Informe o CEP para preencher o endereço automaticamente.</p>
                        </div>
                    </div>

                    <div className="linha-cep-quadra">
                        <label className="campo-quadra">
                            <span>CEP</span>
                            <input
                                inputMode="numeric"
                                autoComplete="postal-code"
                                value={cep}
                                onChange={(evento) => {
                                    const numeros = evento.target.value.replace(/\D/g, "").slice(0, 8);
                                    setCep(numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros);
                                    setEndereco(null);
                                    setErroCep("");
                                }}
                                onBlur={() => {
                                    if (cep.replace(/\D/g, "").length === 8 && !endereco) buscaEndereco(cep);
                                }}
                                placeholder="00000-000"
                                aria-describedby="mensagem-cep"
                                required
                            />
                        </label>
                        <button className="botao-consultar-cep" type="button" onClick={() => buscaEndereco(cep)} disabled={carregandoCep}>
                            {carregandoCep ? "Buscando..." : "Buscar endereço"}
                        </button>
                    </div>
                    <div id="mensagem-cep" aria-live="polite">
                        {erroCep && <p className="mensagem-formulario erro-formulario">{erroCep}</p>}
                    </div>

                    <div className="grade-endereco-quadra">
                        <label className="campo-quadra">
                            <span>Rua</span>
                            <input value={endereco?.logradouro || ""} placeholder="Preenchido pelo CEP" readOnly />
                        </label>
                        <label className="campo-quadra">
                            <span>Bairro</span>
                            <input value={endereco?.bairro || ""} placeholder="Preenchido pelo CEP" readOnly />
                        </label>
                        <label className="campo-quadra">
                            <span>Cidade</span>
                            <input value={endereco?.cidade || ""} placeholder="Preenchido pelo CEP" readOnly />
                        </label>
                        <label className="campo-quadra campo-uf-quadra">
                            <span>UF</span>
                            <input value={endereco?.uf || ""} placeholder="UF" readOnly />
                        </label>
                    </div>
                </section>

                <section className="secao-formulario-quadra" aria-labelledby="titulo-comodidades-quadra">
                    <div className="titulo-secao-quadra">
                        <span>03</span>
                        <div>
                            <h2 id="titulo-comodidades-quadra">Estrutura e comodidades</h2>
                            <p>Marque o que está disponível no local.</p>
                        </div>
                    </div>

                    <fieldset className="grupo-opcoes-quadra">
                        <legend>O que a quadra oferece?</legend>
                        <div className="opcoes-quadra comodidades-quadra">
                            {comodidadesDisponiveis.map((comodidade) => (
                                <label className="opcao-quadra" key={comodidade}>
                                    <input
                                        type="checkbox"
                                        checked={comodidades.includes(comodidade)}
                                        onChange={() => alternaComodidade(comodidade)}
                                    />
                                    <span>{comodidade}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <label className="campo-quadra">
                        <span>Outros recursos</span>
                        <input
                            value={outros}
                            onChange={(evento) => setOutros(evento.target.value)}
                            placeholder="Ex.: piscina, aluguel de equipamentos"
                        />
                        <small>Separe os itens por vírgula.</small>
                    </label>
                </section>

                <section className="secao-formulario-quadra secao-horarios-quadra" aria-labelledby="titulo-horarios-quadra">
                    <div className="titulo-secao-quadra">
                        <span>04</span>
                        <div>
                            <h2 id="titulo-horarios-quadra">Funcionamento</h2>
                            <p>Defina os dias e horários em que recebe reservas.</p>
                        </div>
                    </div>

                    <div className="lista-horarios-quadra">
                        {diasDaSemana.map((dia) => (
                            <div className={`linha-horario-quadra ${funcionamento[dia.valor].aberto ? "dia-aberto" : "dia-fechado"}`} key={dia.valor}>
                                <label className="seletor-dia-quadra">
                                    <input
                                        type="checkbox"
                                        checked={funcionamento[dia.valor].aberto}
                                        onChange={(evento) => atualizaDia(dia.valor, "aberto", evento.target.checked)}
                                    />
                                    <span>{dia.nome}</span>
                                </label>
                                {funcionamento[dia.valor].aberto ? (
                                    <div className="campos-horario-quadra">
                                        <label>
                                            <span>Abre</span>
                                            <input type="time" value={funcionamento[dia.valor].inicio} onChange={(evento) => atualizaDia(dia.valor, "inicio", evento.target.value)} required />
                                        </label>
                                        <span className="separador-horario">às</span>
                                        <label>
                                            <span>Fecha</span>
                                            <input type="time" value={funcionamento[dia.valor].fim} onChange={(evento) => atualizaDia(dia.valor, "fim", evento.target.value)} required />
                                        </label>
                                    </div>
                                ) : (
                                    <span className="texto-fechado-quadra">Fechado</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {mensagem && (
                    <p className={`mensagem-formulario ${mensagem.tipo === "erro" ? "erro-formulario" : "sucesso-formulario"}`} role="status">
                        {mensagem.texto}
                    </p>
                )}

                <div className="acoes-formulario-quadra">
                    <button className="botao-criar-quadra" type="submit" disabled={salvando}>
                        {salvando ? "Cadastrando..." : "Cadastrar quadra"}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default CriarQuadra;