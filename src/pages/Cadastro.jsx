import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Cadastro.css";

function Cadastro() {
    const navigate = useNavigate();
    const [nome, alteraNome] = useState("");
    const [dataNascimento, alteraDataNascimento] = useState("");
    const [email, alteraEmail] = useState("");
    const [senha, alteraSenha] = useState("");
    const [confirmaSenha, alteraConfirmaSenha] = useState("");
    const [mostrarSenha, alteraMostrarSenha] = useState(false);
    const [mostrarConfirmaSenha, alteraMostrarConfirmaSenha] = useState(false);
    const [salvando, alteraSalvando] = useState(false);

    async function inserirUsuario(evento) {
        evento.preventDefault();

        if (!supabase) {
            alert("Não foi possível conectar ao serviço do Supabase.");
            return;
        }

        if (senha !== confirmaSenha) {
            alert("A confirmação de senha não confere com a senha digitada.");
            return;
        }

        if (senha.length < 6) {
            alert("A senha deve conter no mínimo 6 caracteres.");
            return;
        }

        alteraSalvando(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: senha,
                options: {
                    data: {
                        nome: nome.trim(),
                        data_nascimento: dataNascimento,
                    },
                },
            });

            if (error) {
                console.error("Erro ao cadastrar usuário no Supabase Auth:", error);
                const usuarioJaCadastrado = error.code === "user_already_exists"
                    || /user already registered/i.test(error.message || "");

                if (usuarioJaCadastrado) {
                    const { data: dadosLogin, error: erroLogin } = await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password: senha,
                    });

                    if (erroLogin) {
                        alert("Este e-mail já está cadastrado. Para continuar, informe a senha correta ou faça login com sua conta.");
                        return;
                    }

                    const { data: perfilExistente, error: erroBuscaPerfil } = await supabase
                        .from("usuarios")
                        .select("id,nome,email,data_nascimento")
                        .eq("email", email.trim())
                        .maybeSingle();

                    if (erroBuscaPerfil) {
                        await supabase.auth.signOut({ scope: "local" });
                        alert("Sua senha foi confirmada, mas não foi possível verificar seu perfil. Tente novamente mais tarde.");
                        return;
                    }

                    let perfilUsuario = perfilExistente;
                    if (!perfilUsuario) {
                        const { data: perfilCriado, error: erroPerfil } = await supabase
                            .from("usuarios")
                            .insert({
                                nome: nome.trim(),
                                email: email.trim(),
                                data_nascimento: dataNascimento,
                                socio: false,
                            })
                            .select("id,nome,email,data_nascimento")
                            .single();

                        if (erroPerfil) {
                            await supabase.auth.signOut({ scope: "local" });
                            console.error("Erro ao restaurar perfil do usuário:", erroPerfil);
                            alert(`Sua senha foi confirmada, mas não foi possível restaurar o perfil: ${erroPerfil.message}`);
                            return;
                        }

                        perfilUsuario = perfilCriado;
                    }

                    const dadosUsuario = {
                        id: dadosLogin.user.id,
                        auth_id: dadosLogin.user.id,
                        perfil_id: perfilUsuario.id,
                        nome: perfilUsuario.nome || nome.trim(),
                        email: dadosLogin.user.email || email.trim(),
                        data_nascimento: perfilUsuario.data_nascimento || dataNascimento,
                    };

                    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
                    navigate("/perfil");
                    return;
                }

                const limiteDeEmail = error.status === 429
                    || /rate.?limit|too many requests/i.test(error.message || "");

                if (limiteDeEmail) {
                    alert("O Supabase limitou temporariamente o envio de e-mails de cadastro. Aguarde antes de tentar novamente. Para evitar esse limite durante testes, configure um SMTP próprio em Authentication > SMTP Settings.");
                } else {
                    alert(`Não foi possível cadastrar o usuário: ${error.message}`);
                }
                return;
            }

            const { data: perfilExistente, error: erroBuscaPerfil } = await supabase
                .from("usuarios")
                .select("id")
                .eq("email", email.trim())
                .maybeSingle();

            if (erroBuscaPerfil) {
                console.error("Erro ao verificar o perfil na tabela usuarios:", erroBuscaPerfil);
                alert("A conta foi criada, mas não foi possível verificar os dados do perfil. Tente entrar e confira a conexão com o banco.");
                return;
            }

            if (!perfilExistente) {
                const { error: erroPerfil } = await supabase.from("usuarios").insert({
                    nome: nome.trim(),
                    email: email.trim(),
                    data_nascimento: dataNascimento,
                    socio: false,
                });

                if (erroPerfil) {
                    console.error("Erro ao salvar o perfil na tabela usuarios:", erroPerfil);
                    alert(`A conta foi criada, mas não foi possível salvar o perfil: ${erroPerfil.message}`);
                    return;
                }
            }

            if (!data.session) {
                alert("Cadastro iniciado! Confira seu e-mail para confirmar a conta e depois faça login.");
                navigate("/login");
                return;
            }

            const dadosUsuario = {
                id: data.user.id,
                auth_id: data.user.id,
                nome: nome.trim(),
                email: email.trim(),
                data_nascimento: dataNascimento,
            };

            localStorage.setItem("usuario", JSON.stringify(dadosUsuario));

            navigate("/perfil");
        } catch (error) {
            console.error("Erro inesperado ao cadastrar usuário:", error);
            alert("Ocorreu um erro ao cadastrar. Confira os dados digitados.");
        } finally {
            alteraSalvando(false);
        }
    }

    return (
        <main id="pagina-cadastro" className="pagina-cadastro">
            <div className="card-cadastro">
                <div className="header-cadastro">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                        <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-8c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm8-3h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12z"/>
                    </svg>
                    <h1>Cadastre-se</h1>
                </div>

                <form className="form-cadastro" onSubmit={inserirUsuario}>
                    <div className="campo-cadastro">
                        <label htmlFor="cad-nome">Nome Completo:</label>
                        <input
                            id="cad-nome"
                            type="text"
                            placeholder="Ex: Ana Silva"
                            required
                            value={nome}
                            onChange={(e) => alteraNome(e.target.value)}
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="cad-nasc">Data de Nascimento:</label>
                        <input
                            id="cad-nasc"
                            type="date"
                            required
                            value={dataNascimento}
                            onChange={(e) => alteraDataNascimento(e.target.value)}
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="cad-email">Telefone/Email:</label>
                        <input
                            id="cad-email"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            required
                            value={email}
                            onChange={(e) => alteraEmail(e.target.value)}
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="cad-senha">Crie uma senha:</label>
                        <div className="campo-senha-cadastro">
                            <input
                                id="cad-senha"
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                value={senha}
                                onChange={(e) => alteraSenha(e.target.value)}
                            />
                            <button
                                type="button"
                                className="botao-mostrar-senha-cadastro"
                                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                aria-pressed={mostrarSenha}
                                onClick={() => alteraMostrarSenha(!mostrarSenha)}
                            >
                                {mostrarSenha ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="cad-confirma">Confirme sua senha:</label>
                        <div className="campo-senha-cadastro">
                            <input
                                id="cad-confirma"
                                type={mostrarConfirmaSenha ? "text" : "password"}
                                placeholder="Digite novamente a senha"
                                required
                                minLength={6}
                                value={confirmaSenha}
                                onChange={(e) => alteraConfirmaSenha(e.target.value)}
                            />
                            <button
                                type="button"
                                className="botao-mostrar-senha-cadastro"
                                aria-label={mostrarConfirmaSenha ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                                aria-pressed={mostrarConfirmaSenha}
                                onClick={() => alteraMostrarConfirmaSenha(!mostrarConfirmaSenha)}
                            >
                                {mostrarConfirmaSenha ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-salvar-cadastro" disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar Login"}
                    </button>

                    <p className="link-login-retorno">
                        Já possui uma conta? <Link to="/login">Faça login aqui!</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}

export default Cadastro;