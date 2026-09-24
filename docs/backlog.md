## Feature: seleção de esporte e disponibilidade de quadras

- Status: implementada no front-end.
- `Home.jsx` exibe as opções Futebol, Futvôlei, Tênis e Beach Tênis.
- Cada opção navega para `/quadras?esporte=<valor>`.
- `Quadras.jsx` mantém a tela vazia enquanto não existem dados cadastrados.
- Próxima etapa: buscar as quadras no Supabase e filtrar pelo parâmetro `esporte` quando ele existir.
