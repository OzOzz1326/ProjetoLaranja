import { useRef, useState } from "react";
import "./Contato.css";

const estadoInicialContato = {
    nome: "",
    whatsapp: "",
    email: "",
    problema: "",
    descricao: "",
    atualizacoesEmail: false,
    atualizacoesWhatsapp: false,
};

function Contato() {
    const descricaoRef = useRef(null);
    const formRef = useRef(null);
    const [formulario, setFormulario] = useState(estadoInicialContato);

    const handleChange = (evento) => {
        const { name, value, type, checked } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAssunto = (evento) => {
        const { value } = evento.target;
        setFormulario((anterior) => ({ ...anterior, problema: value }));

        if (value) {
            descricaoRef.current?.focus();
        }
    };

    const handleSubmit = (evento) => {
        evento.preventDefault();
        setFormulario(estadoInicialContato);
        formRef.current?.reset();
    };

    return (
        <main id="pagina-contato" className="pagina-contato">
            <div className="conteudo-contato">
                <div className="bloco-formulario-contato">
                    <div className="cabecalho-formulario-contato">
                        <span className="marcador-contato">SPORT IN CITY</span>
                        <h1>Fale com a gente</h1>
                        <p>Conte pra gente o que aconteceu e nossa equipe entrará em contato.</p>
                    </div>

                    <form ref={formRef} className="formulario-contato" onSubmit={handleSubmit}>
                        <div className="campos-contato">
                            <div className="campo-contato campo-amplo">
                                <label htmlFor="contato-nome">Nome completo</label>
                                <input
                                    id="contato-nome"
                                    name="nome"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Seu nome e sobrenome"
                                    value={formulario.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="campo-contato">
                                <label htmlFor="contato-whatsapp">WhatsApp</label>
                                <input
                                    id="contato-whatsapp"
                                    name="whatsapp"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="(00) 00000-0000"
                                    value={formulario.whatsapp}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="campo-contato">
                                <label htmlFor="contato-email">E-mail</label>
                                <input
                                    id="contato-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="voce@exemplo.com"
                                    value={formulario.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="campo-contato">
                                <label htmlFor="contato-problema">Assunto</label>
                                <select
                                    id="contato-problema"
                                    name="problema"
                                    value={formulario.problema}
                                    onChange={handleAssunto}
                                    required
                                >
                                    <option value="" disabled>Selecione um assunto</option>
                                    <option value="cadastro-quadra">Cadastro de quadra</option>
                                    <option value="pagamento">Problemas com pagamento</option>
                                    <option value="reserva">Reserva de quadra</option>
                                    <option value="conta">Login ou cadastro de conta</option>
                                    <option value="site">Funcionamento do site</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>

                            <div className="campo-contato campo-descricao-contato">
                                <label htmlFor="contato-descricao">Como podemos ajudar?</label>
                                <textarea
                                    ref={descricaoRef}
                                    id="contato-descricao"
                                    name="descricao"
                                    rows="5"
                                    placeholder="Descreva o problema ou conte como podemos ajudar..."
                                    value={formulario.descricao}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <fieldset className="preferencias-contato">
                            <legend>Quero receber atualizações sobre meu contato por:</legend>
                            <label htmlFor="atualizacoes-email">
                                <input
                                    id="atualizacoes-email"
                                    name="atualizacoesEmail"
                                    type="checkbox"
                                    checked={formulario.atualizacoesEmail}
                                    onChange={handleChange}
                                />
                                <span>E-mail</span>
                            </label>
                            <label htmlFor="atualizacoes-whatsapp">
                                <input
                                    id="atualizacoes-whatsapp"
                                    name="atualizacoesWhatsapp"
                                    type="checkbox"
                                    checked={formulario.atualizacoesWhatsapp}
                                    onChange={handleChange}
                                />
                                <span>WhatsApp</span>
                            </label>
                        </fieldset>

                        <button className="botao-enviar-contato" type="submit">Enviar mensagem</button>
                    </form>
                </div>

                <aside className="imagem-campo-contato">
                    <img src="../quadracontato.jpg" alt="Campo de futebol preparado para a prática esportiva" />
                    <div className="legenda-campo-contato">
                        <span>SPORT IN CITY</span>
                        <h2>Seu próximo jogo começa aqui.</h2>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Contato;