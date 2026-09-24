import "./Cadastro.css";

function Cadastro() {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <main className="pagina-cadastro">
            <div className="titulo-pagina">
                <h1>Crie sua conta</h1>
                <p>Preencha os dados abaixo para começar a usar o Sport In City</p>
            </div>

            <div className="card-form cadastro-card">
                <h2>Cadastro</h2>

                <form className="form-cadastro" onSubmit={handleSubmit}>
                    <div className="campo">
                        <label htmlFor="nome-completo">Nome completo</label>
                        <input
                            type="text"
                            id="nome-completo"
                            name="nome-completo"
                            placeholder="Ex: João da Silva"
                            required
                            minLength="3"
                        />
                    </div>

                    <div className="campos-linha">
                        <div className="campo">
                            <label htmlFor="data-nascimento">Data de Nascimento</label>
                            <input
                                type="date"
                                id="data-nascimento"
                                name="data-nascimento"
                                required
                            />
                        </div>

                        <div className="campo">
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                type="tel"
                                id="telefone"
                                name="telefone"
                                placeholder="(16) 99999-9999"
                                required
                            />
                        </div>
                    </div>

                    <div className="campo">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="seuemail@exemplo.com"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            name="senha"
                            placeholder="Crie uma senha segura"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="termos">
                        <label>
                            <input type="checkbox" required />
                            <span>Li e aceito os termos e condições.</span>
                        </label>
                    </div>

                    <button type="submit" className="btn-salvar">
                        Cadastrar
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Cadastro;