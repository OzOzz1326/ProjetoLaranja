# Backlog do projeto Sport In City

## Estado atual

Revisado em 05/10/2026 comparando o código de `src/`, as migrações versionadas e a saída do esquema remoto de `public.quadras` enviada pelo usuário. O projeto tem autenticação Supabase, busca de quadras com tolerância a acentos e pequenos erros, cadastro de quadras, perfil com reservas reais e um fluxo de reserva com pagamento simulado. Ainda não está pronto para produção: não há proteção central das rotas, o pagamento não processa cobranças, o formulário de contato não envia mensagens e existe uma rota `/perfil` duplicada. O esquema de `usuarios` e `reservas` e as permissões remotas ainda não foram confirmados.

O cliente Supabase depende de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Conforme confirmação do usuário em 01/10/2026, as migrações de reservas e armazenamento de avatares foram executadas no projeto Supabase. A execução da migração de cadastro de quadras por sócios ainda não foi confirmada. O esquema completo e a cobertura atual das políticas RLS também precisam ser verificados, mas neste momento a aplicação será operada com RLS desativado temporariamente.

## Prioridade 1: Segurança e integridade

- [x] Remover o fallback de usuário da reserva: a confirmação exige sessão e relaciona os blocos ao perfil autenticado.
- [ ] Proteger centralmente as rotas de perfil, cadastro de quadra e reserva. Hoje o perfil mostra estado sem sessão, o cadastro de quadra valida sessão/sócio e o pagamento exige sessão ao confirmar; `src/App.jsx` ainda não tem guardas de rota.
- [x] Inserir todos os blocos horários do intervalo em uma única operação e tratar conflito `23505`; a migração com índice único foi executada no Supabase (confirmação do usuário em 01/10/2026).
- [x] Mostrar dias de funcionamento a partir de hoje, selecionar início e término em blocos de uma hora, ocultar horários já passados hoje e calcular o preço pela duração.
- [x] Executar `docs/migracoes/supabase-reservas-horarios.sql` para agrupar horas da mesma reserva e impedir conflitos simultâneos por quadra, data e horário (execução confirmada pelo usuário em 01/10/2026).
- [ ] Confirmar e documentar o esquema e as chaves de `usuarios` e `reservas`, incluindo o nome atual da coluna `horaio`, antes de alterar consultas ou criar migrações. O esquema de `quadras` foi documentado abaixo com base na saída remota enviada pelo usuário.
- [ ] Confirmar e documentar as permissões efetivas do banco com RLS desativado, conforme a decisão atual do projeto. O estado remoto e as permissões de `usuarios`/`reservas` ainda não foram verificados; não ativar RLS nesta etapa.

## Prioridade 2: Fechar os fluxos principais

### Quadras e descoberta
- [x] Buscar quadras no Supabase em `src/pages/Quadras.jsx`.
- [x] Filtrar por esporte e pelo termo de busca na URL (nome, descrição e modalidade).
- [x] Normalizar acentos e aceitar até uma pequena diferença de letra por palavra na busca de quadras.
- [x] Exibir carregamento, lista e estado sem resultados.
- [x] Separar erro de consulta do estado sem resultados; falhas exibem mensagem própria e ação para tentar novamente.
- [x] Compartilhar entre Home, cadastro, filtros e detalhes os esportes Futebol, Fut-vôlei, Tennis e BeachTennis, com slugs canônicos e compatibilidade de leitura para valores antigos.
- [x] Aplicar ao filtro de quadras a paleta do esporte selecionado: verde da marca para Futebol, amarelo para Fut-vôlei, azul para Tennis e laranja para BeachTennis.
- [x] Implementar somente o filtro por preço máximo por hora; filtros por cidade, bairro e disponibilidade ficam adiados até confirmar os campos correspondentes no esquema.
- [x] Remover o ID padrão `23` de `src/pages/Detalhes.jsx`; mostrar estado de identificação ausente quando a URL não trouxer ID.
- [x] Incluir endereço, capacidade e cobertura no formulário de cadastro, pois são exibidos nos detalhes da quadra.
- [x] Confirmar e documentar campos, nulabilidade, tipos, defaults e chaves de `public.quadras` com a saída do esquema remoto enviada pelo usuário em 05/10/2026. A migração versionada de quadras trata apenas de RLS, não define a tabela.

Esquema confirmado de `public.quadras`:

| Coluna | Tipo | Aceita `NULL` | Default | Chave |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | Não | — | Primary key (`quadras_pkey`) |
| `id_usuario` | `bigint` | Não | — | Foreign key para `usuarios.id` (`quadras_id_usuario_fkey`) |
| `nome` | `text` | Não | — | — |
| `imagem` | `text` | Sim | — | — |
| `endereco` | `text` | Não | — | — |
| `descricao` | `text` | Sim | — | — |
| `capacidade` | `smallint` | Não | — | — |
| `cobertura` | `boolean` | Não | — | — |
| `preco` | `bigint` | Sim | — | — |
| `outros` | `text` | Sim | — | — |
| `tipo_jogo` | `text` | Não | — | — |
| `horario_inicio` | `time without time zone` | Sim | — | — |
| `horario_fim` | `time without time zone` | Sim | — | — |
| `funcionamento_seg` | `boolean` | Sim | — | — |
| `funcionamento_ter` | `boolean` | Sim | — | — |
| `funcionamento_qua` | `boolean` | Sim | — | — |
| `funcionamento_qui` | `boolean` | Sim | — | — |
| `funcionamento_sex` | `boolean` | Sim | — | — |
| `funcionamento_sab` | `boolean` | Sim | — | — |
| `funcionamento_dom` | `boolean` | Sim | — | — |
| `created_at` | `timestamp with time zone` | Não | `now()` | — |

A saída recebida não informa `is_identity`/`identity_generation`; o `column_default` de `id` veio nulo, portanto a estratégia de geração automática do identificador ainda não foi confirmada.

- [ ] Confirmar se `public.quadras.id` é `IDENTITY` ou usa uma sequence, pois o cadastro não envia `id` e a saída remota não mostrou default; validar que o insert gera o identificador automaticamente.

### Cadastro, login e perfil
- [x] Criar conta com Supabase Auth e salvar/consultar dados complementares em `usuarios`.
- [x] Se a conta Auth já existir, validar a senha e restaurar o perfil ausente em `usuarios` antes de continuar para o perfil.
- [x] Entrar com `signInWithPassword` e atualizar os dados usados pelo avatar do menu.
- [x] Bloquear o login quando o usuário autenticado no Supabase não tiver perfil em `usuarios`; localizar o perfil sem diferenciar maiúsculas no e-mail e encerrar a sessão local quando não houver correspondência ou ela não puder ser verificada.
- [x] Exibir perfil, permitir edição de nome e encerrar sessão via Supabase Auth.
- [x] Tratar erros retornados ao atualizar o perfil e ao salvar dados complementares; não considerar a operação concluída quando o Supabase retorna erro.
- [x] Garantir que o perfil e o menu sejam carregados da sessão autenticada, em vez de depender exclusivamente do valor salvo no `localStorage`.
- [x] Checklist Ana: cadastro grava os dados complementares em `usuarios`; login navega sem recarga integral; cadastro de quadra valida sessão no acesso e no envio; perfil lista reservas futuras; mensagens de sucesso redundantes foram removidas.
- [x] Mostrar no perfil todas as reservas futuras do usuário, ordenadas por data e hora, agrupando blocos com o mesmo `grupo_reserva` e relacionando cada reserva à quadra.
- [x] Remover alerts de sucesso redundantes de login, cadastro, salvamento de nome, logout e cadastro de quadra; erros e confirmações importantes continuam visíveis.
- [x] Exibir orientação de cadastro junto ao erro genérico de credenciais inválidas, sem revelar se um e-mail específico existe; explicar o limite temporário de envio de e-mails quando o Supabase retornar rate limit.
- [x] Permitir selecionar uma foto JPG, PNG ou WebP de até 5 MB e salvar no bucket público `avatars`, com URL nos metadados do Auth.
- [x] Adicionar controles independentes para mostrar/ocultar senha no login e nos campos de senha e confirmação do cadastro.
- [x] Executar `docs/migracoes/supabase-avatar-storage.sql` no SQL Editor do Supabase para criar o bucket e as políticas necessárias ao upload da foto (execução confirmada pelo usuário em 01/10/2026).
- [x] Remover a declaração duplicada da rota `/perfil` em `src/App.jsx`.

### Cadastro de quadra
- [x] Cadastrar quadra no Supabase com proprietário, modalidade, preço, imagem, dias/horários e campo `outros`.
- [x] Validar campos obrigatórios, ao menos um dia aberto e horário final posterior ao inicial.
- [x] Verificar sessão e localizar o perfil do proprietário antes de inserir.
- [x] Restringir botões, acesso à rota e envio do cadastro de quadras a perfis com `usuarios.socio === true`; novos cadastros recebem `socio: false` e não sócios são encaminhados à página de contato.
- [x] Manter o cadastro de quadras restrito a sócios na aplicação com RLS desativado; não executar `docs/migracoes/supabase-socios-quadras.sql` enquanto a decisão for manter RLS desligado, pois essa migração o ativa.
- [x] Coletar o endereço obrigatório da quadra e enviá-lo à coluna `quadras.endereco`.
- [x] Coletar capacidade e cobertura e enviá-las como número e booleano ao cadastrar a quadra.
- [x] Exibir e tratar os erros do cadastro, incluindo erros retornados nas consultas de sessão e perfil do proprietário.
- [ ] Implementar edição e remoção de quadras próprias, se essas operações fizerem parte do escopo final.

### Reserva e pagamento
- [x] Buscar detalhes da quadra pelo ID e oferecer formulário de solicitação de reserva.
- [x] Consultar reservas existentes e inserir reserva na tabela `reservas`.
- [x] Ligar reserva e pagamento no fluxo simulado, levando quadra, data, horários, participantes e preço selecionados para a tela de pagamento.
- [x] Ligar a seleção da reserva à tela de pagamento de teste; gravar a reserva em `reservas` somente após a confirmação simulada e bloquear horário já reservado.
- [x] Permitir cancelar individualmente cada reserva futura pelo perfil, removendo somente o grupo selecionado do usuário autenticado e liberando os horários.
- [x] Exibir no pagamento o resumo dinâmico da quadra, data, horário, participantes e preço.
- [x] Resolver o perfil do pagador pela mesma busca case-insensitive usada no login, evitando falha de correspondência por caixa do e-mail.
- [x] Calcular o total pelo número de horas reservadas e limitar participantes à capacidade cadastrada da quadra.
- [x] Impedir reservas com horário de início já passado no dia atual e revalidar o horário antes de gravar a reserva.
- [ ] Validar com Supabase configurado a confirmação simulada e o bloqueio do horário em outra sessão com RLS desativado temporariamente; a prevenção atômica de concorrência continua pendente.
- [x] Adicionar controle do modo de pagamento de teste para o e-mail definido em `VITE_ADMIN_EMAIL`; a preferência do toggle vale somente para o navegador atual.
- [ ] Definir integração e regras de pagamento. A tela informa corretamente que não processa cobranças; não coletar nem armazenar dados de cartão sem uma solução de pagamento aprovada.

## Prioridade 3: Conteúdo e acabamento

- [x] Criar página de contato com formulário responsivo, seleção de assunto com foco automático na descrição e foto de campo ao lado, além da página sobre e navegação do rodapé.
- [x] Aplicar CSS próprio às telas e componentes existentes.
- [x] Definir o título da aba do navegador como `Sport In City` e usar uma versão compacta e legível da marca como favicon.
- [x] Exibir somente os quatro esportes no primeiro viewport da Home; incluir seta acessível para rolar até Sobre nós e revelar a navbar fixa ao ativá-la ou iniciar o scroll; separar a seção com `<hr>` e título `<h2>Sobre nós</h2>` estilizado.
- [x] Substituir a foto repetida do estádio pelo fundo animado de gotas fundidas, com paleta verde padrão e cores temáticas por esporte nas listagens filtradas.
- [x] Remover emojis usados como ícones decorativos; manter rótulos textuais, controles claros e apenas símbolos simples quando apropriado.
- [x] Exibir a foto cadastrada da quadra no cartão da próxima reserva do perfil, usando `public/quadracontato.jpg` quando a imagem estiver ausente ou indisponível.
- [ ] Integrar o formulário de contato a um canal de atendimento, validar os dados enviados e confirmar como as preferências de atualização serão usadas.
- [x] Substituir a próxima partida fixa no perfil por uma lista das reservas futuras reais do usuário, com dados da quadra e cancelamento individual.
- [x] Aplicar fundo animado de partículas conectadas e paleta cinza à tela inicial, páginas comuns, menu e rodapé, mantendo o fundo temático nas rotas de quadras e detalhes esportivos.
- [ ] Revisar acessibilidade, mensagens e comportamento responsivo dos fluxos de busca, cadastro e reserva.

## Validação e publicação

- [x] `npm.cmd run build` passou em 29/09/2026 após a implementação da checklist; Vite ainda avisa que o bundle JavaScript ultrapassa 500 kB.
- [x] `npm.cmd run lint` passou em 29/09/2026 após corrigir a inicialização do estado do perfil.
- [x] `npm.cmd run lint` e `npm.cmd run build` passaram após implementar consulta de próxima reserva, upload de avatar e proteção da tela de cadastro de quadra.
- [x] Em 01/10/2026, ESLint focado passou para `src/pages/Quadras.jsx` e `npm.cmd run build` passou após a busca aproximada; Vite ainda avisa que o bundle ultrapassa 500 kB.
- [x] Em 02/10/2026, lint focado de `src/components/MenuSuperior.jsx`, build de produção e teste no navegador passaram após ajustar a Home; verificado que só os quatro esportes aparecem no topo e que a navbar fixa surge ao rolar. O aviso de bundle acima de 500 kB permanece.
- [x] Em 02/10/2026, lint focado de `src/pages/Perfil.jsx` e build de produção passaram após implementar a lista de reservas futuras agrupadas e canceláveis individualmente; o aviso de bundle acima de 500 kB permanece.
- [x] Em 05/10/2026, ESLint global e build de produção passaram; Vite ainda avisa que o bundle JavaScript ultrapassa 500 kB.
- [x] Em 05/10/2026, usuário confirmou que passaram os testes com Supabase configurado: cadastro, login, logout, busca, cadastro de quadra, detalhes, reserva concorrente e erros de rede/banco.
- [ ] Testar rotas protegidas com sessão ausente, expirada e válida.
- [ ] Confirmar variáveis de ambiente, esquema, chaves estrangeiras, índices e estado do banco em ambiente de publicação com RLS desativado temporariamente.
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

Priorizar guardas centrais de rota e remover a rota `/perfil` duplicada. Confirmar o esquema de `usuarios`/`reservas`, verificar as permissões remotas mantendo RLS desativado e testar a reserva com duas sessões. Não executar a migração de sócios/quadras enquanto ela ativar RLS.
