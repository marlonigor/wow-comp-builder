# WoW Forever Comp Builder

Monte grupos de Dungeon e Raid para **World of Warcraft: Forever**. O painel de cobertura ajuda quem organiza o grupo a ver quais utilitários já estão disponíveis e quais ainda faltam.

## Rode no seu computador

Com o [Node.js 26](https://nodejs.org/) instalado, abra o terminal na pasta do projeto e execute:

```sh
npm ci
npm run dev
```

Abra o endereço que o terminal mostrar, normalmente `http://localhost:5173`.

## Monte e compartilhe uma composição

1. Escolha Dungeon ou Raid e, quando disponível, a masmorra.
2. Clique em **Vaga livre** para escolher uma especialização compatível. Pelo teclado, pressione `/`, digite `rdruid` e pressione `Enter` para adicionar Restoration Druid à primeira vaga livre de curador.
3. Selecione um alerta crítico para priorizar especializações compatíveis. Expanda **Cobertos** para ver os utilitários em verde e seus fornecedores, ou **Opcionais não cobertos** para explorar melhorias.
4. Copie o endereço da página para compartilhar a composição. Um endereço `localhost` só funciona no computador onde o servidor está rodando.

O catálogo usa dados de **WoW Forever 1.60.1.70862**. Os talentos cadastrados consideram as builds recomendadas nos guias. Algumas masmorras ainda usam o perfil geral.

As sugestões ficam recolhidas quando não há busca ou prioridade. Ao completar o grupo, remova um integrante para liberar sua vaga e escolher outro. Mudar de modo reinicia a composição atual.

Consulte a [especificação](docs/documenta_o_oficial_wow_forever_comp_builder.md) e o [estado do desenvolvimento](docs/development-status.md) para ver as fontes, os testes e as limitações do catálogo.
