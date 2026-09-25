import { useState } from "react";
import { supabase } from "../supabase";
import "./Cadastro.css";

function Cadastro() {
    const [nome, alteraNome] = useState("")
    const [dataNascimento, alteraDataNascimento] = useState("")
    const [email, alteraEmail] = useState("")
    const [senha, alteraSenha] = useState("")
    const [salvando, alteraSalvando] = useState(false)

    async function inserirUsuario() {
        if (!supabase) {
            alert("Não foi possível conectar ao serviço de cadastro.")
            return
        }

        alteraSalvando(true)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: senha,
                options: {
                    data: {
                        nome,
                        data_nascimento: dataNascimento,
                    },
                },
            })

            if (error) {
                console.error("Erro ao cadastrar usuário no Supabase Auth:", error)
                alert(`Não foi possível cadastrar o usuário: ${error.message}`)
                return
            }

            const { data: perfil, error: erroBuscaPerfil } = await supabase
                .from("usuarios")
                .select("id")
                .eq("email", email)
                .maybeSingle()

            if (erroBuscaPerfil) {
                console.error("Erro ao localizar o perfil do usuário:", erroBuscaPerfil)
                alert(`A conta foi criada, mas não foi possível localizar o perfil: ${erroBuscaPerfil.message}`)
                return
            }

            if (!perfil) {
                const { error: erroPerfil } = await supabase.from("usuarios").insert({
                    nome,
                    email,
                    data_nascimento: dataNascimento,
                })

                if (erroPerfil) {
                    console.error("Erro ao criar o perfil do usuário:", erroPerfil)
                    alert(`A conta foi criada, mas não foi possível salvar o perfil: ${erroPerfil.message}`)
                    return
                }
            }

            alert(data.session
                ? "Usuário cadastrado com sucesso!"
                : "Cadastro iniciado. Confira seu e-mail para confirmar a conta.")
            alteraNome("")
            alteraDataNascimento("")
            alteraEmail("")
            alteraSenha("")
        } catch (error) {
            console.error("Erro inesperado ao cadastrar usuário:", error)
            alert("Ocorreu um erro ao cadastrar. Confira o console do navegador.")
        } finally {
            alteraSalvando(false)
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

                    <button type="submit" className="btn-salvar" disabled={salvando}>
                        {salvando ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Cadastro;