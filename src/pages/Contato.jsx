import "./Contato.css"

const equipe = [
    { nome: "Ana Martins", funcao: "Gerente da unidade", setor: "GESTÃO", telefone: "+55 (00) 00000-0000", email: "ana.martins@example.com" },
    { nome: "Lucas Ferreira", funcao: "Reservas e horários", setor: "RESERVAS", telefone: "+55 (00) 00000-0000", email: "lucas.ferreira@example.com" },
    { nome: "Camila Rocha", funcao: "Atendimento ao cliente", setor: "ATENDIMENTO", telefone: "+55 (00) 00000-0000", email: "camila.rocha@example.com" },
    { nome: "Rafael Mendes", funcao: "Manutenção das quadras", setor: "ESTRUTURA", telefone: "+55 (00) 00000-0000", email: "rafael.mendes@example.com" },
    { nome: "Bruna Costa", funcao: "Eventos e torneios", setor: "EVENTOS", telefone: "+55 (00) 00000-0000", email: "bruna.costa@example.com" },
    { nome: "Diego Alves", funcao: "Financeiro", setor: "FINANCEIRO", telefone: "+55 (00) 00000-0000", email: "diego.alves@example.com" },
];

function Contato() {
    return (
        <main id="pagina-contato" className="pagina-contato">
            <header className="cabecalho-contato">
                <p className="etiqueta-contato">SPORT IN CITY · EQUIPE</p>
                <h1>Fale com quem cuida do espaço</h1>
                <p>Encontre a pessoa certa para ajudar com sua visita, reserva ou evento.</p>
            </header>

            <p className="aviso-contatos-exemplo">
                Contatos demonstrativos. Substitua nomes, telefones e e-mails pelos dados reais da equipe antes de publicar.
            </p>

            <section className="lista-contatos" aria-label="Equipe do local">
                {equipe.map((pessoa) => (
                    <article className="cartao-contato" key={pessoa.email}>
                        <div className="topo-cartao-contato">
                            <span className="iniciais-contato" aria-hidden="true">
                                {pessoa.nome.split(" ").map((parte) => parte[0]).slice(0, 2).join("")}
                            </span>
                            <span className="setor-contato">{pessoa.setor}</span>
                        </div>
                        <h2>{pessoa.nome}</h2>
                        <p className="funcao-contato">{pessoa.funcao}</p>
                        <div className="dados-contato">
                            <span>Telefone</span>
                            <p>{pessoa.telefone}</p>
                            <span>E-mail</span>
                            <a href={`mailto:${pessoa.email}`}>{pessoa.email}</a>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default Contato;