# Backlog do projeto Sport In City

## Estado atual

Revisado em 29/09/2026 com base no código de `src/` e nas migrações disponíveis. O projeto tem navegação e telas principais implementadas, autenticação Supabase, consulta/cadastro de quadras e gravação de reservas. Isso ainda não representa um fluxo pronto para produção: a página inicial e o pagamento usam dados fixos, as rotas não são protegidas e a reserva tem um fallback que pode atribuir a ação a outro usuário.

O cliente Supabase depende de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. A migração versionada disponível só remove `usuarios.senha`; o esquema completo esperado pelo app e as regras do banco precisam ser confirmados no projeto Supabase.

## Prioridade 1: Segurança e integridade

- [ ] Remover de `src/pages/Detalhes.jsx` o fallback de reserva para o primeiro usuário ou para o ID `1`; exigir sessão válida e relacionar a reserva somente ao usuário autenticado.
- [ ] Proteger as rotas e ações de perfil, cadastro de quadra e reserva, redirecionando usuários sem sessão. A tela e o envio do cadastro de quadra agora verificam a sessão; perfil e reserva ainda precisam de guarda.
- [ ] Validar no servidor/banco a disponibilidade do horário e impedir reservas duplicadas de forma atômica; a consulta seguida de `insert` no cliente permite concorrência.
- [ ] Fazer a data escolhida corresponder ao dia da semana selecionado e aos dias/horários de funcionamento da quadra; hoje `diaSemana` não é usado para validar a data nem a hora.
- [ ] Confirmar e documentar o esquema e as chaves de `usuarios`, `quadras` e `reservas`, incluindo o nome atual da coluna `horaio`, antes de alterar consultas ou criar migrações.
- [ ] Definir políticas RLS e permissões adequadas antes de disponibilizar dados de usuários, quadras e reservas em produção. A arquitetura registra que o RLS está desligado.

## Prioridade 2: Fechar os fluxos principais

### Quadras e descoberta
- [x] Buscar quadras no Supabase em `src/pages/Quadras.jsx`.
- [x] Filtrar por esporte e pelo termo de busca na URL (nome, descrição e modalidade).
- [x] Exibir carregamento, lista e estado sem resultados.
- [ ] Separar erro de consulta do estado sem resultados; atualmente a falha é registrada no console e apresentada como lista vazia.
- [ ] Ligar as modalidades de `src/pages/Home.jsx` aos dados disponíveis no banco ou documentar que a seleção é uma lista fixa intencional.
- [ ] Implementar filtros por cidade, bairro e disponibilidade somente após confirmar os campos existentes no esquema.
- [ ] Remover o ID padrão `23` de `src/pages/Detalhes.jsx`; mostrar estado de identificação ausente quando a URL não trouxer ID.
- [x] Incluir endereço, capacidade e cobertura no formulário de cadastro, pois são exibidos nos detalhes da quadra.
- [ ] Confirmar no esquema remoto todos os campos `NOT NULL`, tipos, defaults e chaves de `quadras`; a definição SQL completa ainda não está versionada neste repositório.

### Cadastro, login e perfil
- [x] Criar conta com Supabase Auth e salvar/consultar dados complementares em `usuarios`.
- [x] Entrar com `signInWithPassword` e atualizar os dados usados pelo avatar do menu.
- [x] Exibir perfil, permitir edição de nome e encerrar sessão via Supabase Auth.
- [x] Tratar erros retornados ao atualizar o perfil e ao salvar dados complementares; não considerar a operação concluída quando o Supabase retorna erro.
- [x] Garantir que o perfil e o menu sejam carregados da sessão autenticada, em vez de depender exclusivamente do valor salvo no `localStorage`.
- [x] Checklist Ana: cadastro grava os dados complementares em `usuarios`; login já navega para a página inicial sem recarga integral do navegador; cadastro de quadra valida sessão no acesso e no envio; o perfil consulta a próxima reserva futura do usuário; removidas mensagens de sucesso redundantes.
- [x] Mostrar no perfil a próxima reserva futura do usuário, ordenada por data e hora em `reservas` e relacionada à quadra.
- [x] Remover alerts de sucesso redundantes de login, cadastro, salvamento de nome, logout e cadastro de quadra; erros e confirmações importantes continuam visíveis.
- [x] Exibir orientação de cadastro junto ao erro genérico de credenciais inválidas, sem revelar se um e-mail específico existe; explicar o limite temporário de envio de e-mails quando o Supabase retornar rate limit.
- [x] Permitir selecionar uma foto JPG, PNG ou WebP de até 5 MB e salvar no bucket público `avatars`, com URL nos metadados do Auth.
- [ ] Executar `docs/migracoes/supabase-avatar-storage.sql` no SQL Editor do Supabase para criar o bucket e as políticas necessárias ao upload da foto.
- [ ] Remover a declaração duplicada da rota `/perfil` em `src/App.jsx`.

### Cadastro de quadra
- [x] Cadastrar quadra no Supabase com proprietário, modalidade, preço, imagem, dias/horários e campo `outros`.
- [x] Validar campos obrigatórios, ao menos um dia aberto e horário final posterior ao inicial.
- [x] Verificar sessão e localizar o perfil do proprietário antes de inserir.
- [x] Coletar o endereço obrigatório da quadra e enviá-lo à coluna `quadras.endereco`.
- [x] Coletar capacidade e cobertura e enviá-las como número e booleano ao cadastrar a quadra.
- [ ] Exibir e tratar os erros do cadastro de forma consistente; conferir também os erros retornados nas consultas de sessão e proprietário.
- [ ] Implementar edição e remoção de quadras próprias, se essas operações fizerem parte do escopo final.

### Reserva e pagamento
- [x] Buscar detalhes da quadra pelo ID e oferecer formulário de solicitação de reserva.
- [x] Consultar reservas existentes e inserir reserva na tabela `reservas`.
- [ ] Ligar reserva e pagamento em um único fluxo, levando quadra, data, horário e preço selecionados para a tela de pagamento.
- [x] Ligar a seleção da reserva à tela de pagamento de teste; gravar a reserva em `reservas` somente após a confirmação simulada e bloquear horário já reservado.
- [x] Exibir no pagamento o resumo dinâmico da quadra, data, horário, participantes e preço.
- [ ] Validar com Supabase configurado a confirmação simulada e o bloqueio do horário em outra sessão; RLS e prevenção atômica de concorrência continuam pendentes.
- [x] Adicionar controle do modo de pagamento de teste para o e-mail definido em `VITE_ADMIN_EMAIL`; a preferência do toggle vale somente para o navegador atual.
- [ ] Definir integração e regras de pagamento. A tela informa corretamente que não processa cobranças; não coletar nem armazenar dados de cartão sem uma solução de pagamento aprovada.

## Prioridade 3: Conteúdo e acabamento

- [x] Criar página de contato com formulário responsivo, seleção de assunto com foco automático na descrição e foto de campo ao lado, além da página sobre e navegação do rodapé.
- [x] Aplicar CSS próprio às telas e componentes existentes.
- [ ] Integrar o formulário de contato a um canal de atendimento, validar os dados enviados e confirmar como as preferências de atualização serão usadas.
- [ ] Substituir a próxima partida fixa exibida no perfil por reservas reais ou remover essa informação até existir dado real.
- [ ] Revisar acessibilidade, mensagens e comportamento responsivo dos fluxos de busca, cadastro e reserva.

## Validação e publicação

- [x] `npm.cmd run build` passou em 29/09/2026 após a implementação da checklist; Vite ainda avisa que o bundle JavaScript ultrapassa 500 kB.
- [x] `npm.cmd run lint` passou em 29/09/2026 após corrigir a inicialização do estado do perfil.
- [x] `npm.cmd run lint` e `npm.cmd run build` passaram após implementar consulta de próxima reserva, upload de avatar e proteção da tela de cadastro de quadra.
- [ ] Testar com Supabase configurado: cadastro, login, logout, busca, cadastro de quadra, detalhes, reserva concorrente e erros de rede/banco.
- [ ] Testar rotas protegidas com sessão ausente, expirada e válida.
- [ ] Confirmar variáveis de ambiente, esquema, chaves estrangeiras, índices e políticas RLS no ambiente de publicação.
- [ ] Fazer revisão final de build e preparar publicação.

## Referência de rotas

- `/` e `/pagina-inicial`: seleção fixa de esportes.
- `/quadras`: busca Supabase, filtro por modalidade e termo.
- `/detalhes/:id` ou `/detalhes?id=...`: detalhes e formulário de reserva.
- `/login`, `/cadastro` e `/perfil`: autenticação e perfil.
- `/cadastrar-quadra`: cadastro Supabase com verificação de usuário no envio.
- `/pagamento`: confirmação simulada que cria uma reserva no banco; ativação geral controlada por `VITE_PAGAMENTO_TESTE_ATIVO` e toggle local visível ao e-mail `VITE_ADMIN_EMAIL`.
- `/contato` e `/sobre`: páginas informativas.

## Próximo passo recomendado

Priorizar a segurança e integridade da reserva: exigir usuário autenticado, remover o fallback para usuário padrão e validar data/horário contra o funcionamento da quadra. Em seguida, confirmar o esquema no Supabase e conectar o pagamento apenas quando os dados da reserva estiverem sendo transportados de ponta a ponta.
