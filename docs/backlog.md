# Backlog do projeto Sport In City

## Visão geral do estado atual

O projeto está em uma fase inicial de desenvolvimento, com a base visual e de navegação já montada e funcionando, mas ainda sem a integração real com o banco e autenticação. A revisão geral do código confirmou que o front-end foi implementado em nível de layout e rotas, enquanto a etapa de busca e persistência de dados no Supabase ainda precisa ser concluída.

## Ordem de desenvolvimento

### 1. Estrutura base do app
- [x] Criar a estrutura React + Vite do projeto.
- [x] Configurar o cliente do Supabase em `src/supabase.js`.
- [x] Definir as rotas principais em `src/App.jsx`.
- [x] Montar o layout global com `MenuSuperior` e `Rodape`.
- [x] Validar que a aplicação compila corretamente com `npm run build`.

### 2. Front-end e design das telas principais
- [x] Implementar a página inicial com seleção de esportes em `src/pages/Home.jsx`.
- [x] Criar a navegação por query string para filtrar quadras por esporte.
- [x] Implementar a página `Quadras` com estado visual para ausência de dados.
- [x] Criar a página de login com formulário visual em `src/pages/Login.jsx`.
- [x] Criar a página de cadastro com validação visual básica em `src/pages/Cadastro.jsx`.
- [x] Definir o estilo visual do projeto em CSS puro por página e por componente.

### 3. Busca e exibição de dados reais
- [x] Conectar a página `Quadras` ao Supabase para buscar registros reais.
- [x] Filtrar os resultados pelo parâmetro `esporte` recebido pela URL.
- [x] Exibir estados de carregamento, vazio e erro na tela de quadras.
- [ ] Definir a estrutura da tabela de quadras com campos como esporte, nome, endereço e disponibilidade.
- [ ] Garantir que a tela inicial e a etapa de seleção de esporte reflitam os dados reais do banco.

### 4. Autenticação e usuários
- [x] Implementar login com `supabase.auth.signInWithPassword`.
- [x] Criar usuários no Supabase Auth e associar perfil pela coluna `email` em `usuarios`.
- [ ] Validar e proteger rotas que exigem login.
- [ ] Criar fluxo de logout e controle de sessão.

### 5. Cadastro e gestão de quadras
- [x] Implementar `src/pages/CriarQuadra.jsx` com formulário de dados principais, dias/horários de funcionamento e comodidades.
- [x] Conectar o formulário ao Supabase usando `id_usuario`, `nome`, `tipo_jogo`, `descricao`, `preco`, `imagem`, `funcionamento_seg` a `funcionamento_dom`, `horario_inicio`, `horario_fim` e `outros`.
- [x] Validar os campos obrigatórios e horários do formulário.
- [ ] Criar a lógica de atualização e remoção de quadras, se necessário.
- [x] Adicionar acesso ao cadastro de quadra na página `Quadras`.

### 6. Melhorias de experiência e regras de negócio
- [ ] Adicionar filtros por cidade, bairro, esporte e disponibilidade.
- [ ] Trabalhar na usabilidade das telas de listagem e cadastro.
- [ ] Ajustar espaçamentos, textos e acessibilidade dos componentes.
- [ ] Melhorar mensagens e feedbacks para o usuário.

### 7. Testes, validação e publicação
- [ ] Testar os fluxos principais: login, cadastro, busca de quadras e cadastro de quadra.
- [ ] Validar regras de negócio e comportamento em cenários de erro.
- [ ] Rodar ajustes finais e revisão de build.
- [ ] Preparar o projeto para publicação.

### 8. Página de contato
- [x] Exibir seis contatos demonstrativos da equipe com funções, telefone e e-mail.
- [ ] Trocar os dados demonstrativos pelos contatos reais do local antes da publicação.

## Observações importantes da revisão de código

- O projeto já está com a base visual funcional, mas ainda está no estágio 1 do desenvolvimento definido em `docs/arquitetura.md`.
- As páginas de formulário e a seleção de esporte não estão conectadas a dados reais de banco.
- A tela `CriarQuadra` cadastra os dados da quadra, os dias e horários de funcionamento e a descrição `outros` via Supabase; falhas de banco são exibidas somente no console.
- Cadastro e login usam Supabase Auth e relacionam o perfil pela coluna `email`; ainda falta proteção global de rotas e logout.
- O caminho principal do app ainda está configurado para `/pagina-inicial`, então a rota raiz pode exigir ajuste de navegação no futuro.

## Próximo passo recomendado

- Priorizar a etapa de busca real no Supabase e a autenticação, porque elas são a base para que as quadras, usuários e cadastros passem a funcionar de forma real e integrada.
