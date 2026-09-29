import { useRef } from "react";
import "./Contato.css";

function Contato() {
    const descricaoRef = useRef(null);

    return (
        <main id="pagina-contato" className="pagina-contato">
            <div className="conteudo-contato">
                <form className="formulario-contato" onSubmit={(evento) => evento.preventDefault()}>
                    <header className="cabecalho-formulario-contato">
                        <img src="/logosfundo.png" alt="Logo Sport In City" />
                        <p>SPORT IN CITY</p>
                        <h1>Como podemos ajudar?</h1>
                        <span>Conte pra gente o que aconteceu e nossa equipe entrará em contato.</span>
                    </header>

                    <div className="campos-contato">
                        <div className="campo-contato">
                            <label htmlFor="contato-nome">Nome completo</label>
                            <input id="contato-nome" name="nome" type="text" autoComplete="name" placeholder="Seu nome e sobrenome" required />
                        </div>

                        <div className="campo-contato">
                            <label htmlFor="contato-whatsapp">WhatsApp</label>
                            <input id="contato-whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" required />
                        </div>

                        <div className="campo-contato">
                            <label htmlFor="contato-email">E-mail</label>
                            <input id="contato-email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required />
                        </div>

                        <div className="campo-contato">
                            <label htmlFor="contato-problema">Assunto</label>
                            <select
                                id="contato-problema"
                                name="problema"
                                defaultValue=""
                                onChange={(evento) => {
                                    if (evento.target.value) descricaoRef.current?.focus();
                                }}
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
                            <textarea ref={descricaoRef} id="contato-descricao" name="descricao" rows="5" placeholder="Descreva o problema ou conte como podemos ajudar..." required />
                        </div>
                    </div>

                    <fieldset className="preferencias-contato">
                        <legend>Quero receber atualizações sobre meu contato por:</legend>
                        <label htmlFor="atualizacoes-email">
                            <input id="atualizacoes-email" name="atualizacoesEmail" type="checkbox" />
                            <span>E-mail</span>
                        </label>
                        <label htmlFor="atualizacoes-whatsapp">
                            <input id="atualizacoes-whatsapp" name="atualizacoesWhatsapp" type="checkbox" />
                            <span>WhatsApp</span>
                        </label>
                    </fieldset>

                    <button className="botao-enviar-contato" type="submit">Enviar mensagem</button>
                </form>

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