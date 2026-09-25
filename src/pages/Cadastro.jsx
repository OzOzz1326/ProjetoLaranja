import { useState } from "react";
import { supabase } from "../supabase";
import "./Cadastro.css";

function Cadastro() {
    const [nome, alteraNome] = useState("")
    const [dataNascimento, alteraDataNascimento] = useState("")
    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState("")

    async function inserirUsuario() {
        const obj = {
            nome: nome,
            email: email,
            senha: senha,
            data_nascimento: dataNascimento
        }

        const { error } = await supabase.from("usuarios").insert(obj)

        if (error == null) {
            alert("Usuário cadastrado com sucesso!")
            alteraNome("")
            alteraDataNascimento("")
            alteraEmail("")
            alteraSenha("")
        } else {
            alert("Erro ao cadastrar usuário. Verifique os dados e tente novamente.")
            console.log(error)
        }
    }

    return (
        <main className="pagina-cadastro">
            <div className="titulo-pagina">
                <h1>Crie sua conta</h1>
                <p>Preencha os dados abaixo para começar a usar o Sport In City</p>
            </div>

            <div className="card-form cadastro-card">
                <h2>Cadastro</h2>

                <form className="form-cadastro" onSubmit={(event) => {
                    event.preventDefault();
                    inserirUsuario();
                }}>
                    <div className="campo">
                        <label htmlFor="nome-completo">Nome completo</label>
                        <input
                            type="text"
                            id="nome-completo"
                            name="nome"
                            placeholder="Ex: João da Silva"
                            required
                            minLength="3"
                            value={nome}
                            onChange={(e) => alteraNome(e.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="data-nascimento">Data de Nascimento</label>
                        <input
                            type="date"
                            id="data-nascimento"
                            name="dataNascimento"
                            required
                            value={dataNascimento}
                            onChange={(e) => alteraDataNascimento(e.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="seuemail@exemplo.com"
                            required
                            value={email}
                            onChange={(e) => alteraEmail(e.target.value)}
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
                            value={senha}
                            onChange={(e) => alteraSenha(e.target.value)}
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