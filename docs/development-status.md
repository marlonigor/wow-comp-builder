# Estado do desenvolvimento

Atualizado em 07/11/2026. A [especificação original](documenta_o_oficial_wow_forever_comp_builder.md) registra o escopo de produto.

## Como testar

Instale as dependências com `sh bin/setup` ou `npm ci`. Execute `npm run dev` e abra o endereço exibido. Escolha Dungeon ou Raid, adicione especializações e selecione um alerta para conferir a ordem da paleta. Abra a URL em outra aba para recuperar a composição.

Rode `sh bin/check` no Git Bash ou `npm run check` no PowerShell. A validação usa Prettier 3.9.10, ESLint 10.14.0, typescript-eslint 8.72.1, os testes do Node e TypeScript 6.0.3 antes do build. O CI usa o mesmo comando e audita as dependências. Em um clone novo, habilite o gancho com `git config core.hooksPath .githooks`. A varredura de histórico antes do push usa Gitleaks 8.30.1.

## Interface e persistência

O Playwright 1.65.0 verifica a cobertura tática em Chromium sem abrir uma janela. `npm test` roda os testes unitários e de navegador. Se você instalou as dependências só com `npm ci`, rode `npm run setup:browser` uma vez para instalar o Chromium de teste. `sh bin/setup` já faz isso. O teste usa um servidor isolado na porta 4175.

- O HTML de referência orientou a mesa tática azul e dourada, a grade de vagas e o painel de cobertura. A montagem continua manual.
- Clique na busca para escolher uma classe pelo ícone e depois uma das três especializações. Os cards têm ícones de especialização, e as vagas preenchidas mostram os ícones de classe e especialização. Os JPEGs vêm do [CDN de ícones do Wowhead](https://wow.zamimg.com/images/wow/icons/large/classicon_druid.jpg) e são servidos junto com a aplicação.
- Pressione `/`, digite `rdruid` e pressione `Enter` para adicionar Restoration Druid à primeira vaga de curador. A busca aceita classe, especialização, atalho ou utilitário. Havendo vários resultados, escolha um card ou refine o termo.
- Passe o mouse ou use `Tab` sobre uma especialização para destacar a vaga de destino. Clique em **Vaga livre** para abrir um seletor filtrado pela função e preencher exatamente aquela posição.
- O seletor da vaga abre numa janela central, inclusive em raids de 40, com foco contido e retorno à vaga ao cancelar. Mostra um resumo dos críticos e opcionais adicionais. `Escape` fecha o seletor.
- Em Cobertura tática, os utilitários que o grupo já oferece aparecem em verde com o rótulo **Coberto** e mostram as vagas e especializações que os fornecem. A lista acompanha as mudanças na composição.
- Ao selecionar uma masmorra, o bloco **Específicos da masmorra** reúne seus alertas próprios e mantém os estados de cobertura e o Smart Fill. A cobertura geral fica separada. Sem requisitos próprios verificados, uma nota discreta informa o uso do perfil geral.
- A busca precede a composição no desktop e no celular. Sugestões compatíveis ficam recolhidas até abrir o grupo, buscar ou selecionar uma prioridade. A paleta filtra opções sem vaga livre antes de limitar os seis resultados.
- Ao completar o grupo, a busca dá lugar a **Grupo completo**. Remover um integrante reabre a busca. O contador aparece somente na composição.
- Pendências críticas permanecem abertas; **Cobertos** e **Opcionais não cobertos** têm contadores e expansão sob demanda. Os requisitos específicos da masmorra permanecem visíveis, inclusive quando cobertos.
- O estado fica na URL e no armazenamento local. IDs do protótipo fictício precisam de um novo link. O botão de copiar link está pendente e as proporções de funções nas Raids são provisórias.

### Revisão de UX de 07/11/2026

A limpeza aplica Hick (menos escolhas simultâneas), Proximidade (seletor contextual) e Occam (remoção de contadores e explicações repetidas). Os testes de regressão de grupo completo, expansão da cobertura e diálogo móvel falharam antes da implementação. A suíte de navegador também mantém os testes de cobertura local e remoção dos fornecedores.

Validação: 25 testes unitários e oito cenários de navegador, além de formatação, lint, tipos e build. O Chromium registra execução em `test-results/**/ui-coverage.json`; uma conferência das linhas mapeadas pelos source maps encontrou 98,17% em `main.tsx` e 100% em `ClassPicker.tsx`, `SlotPicker.tsx` e `CoveragePanel.tsx`. Essa medição de linhas mapeadas não equivale à cobertura de todos os caminhos. A inspeção visual usou desktop e viewport móvel de 390 × 844; o diálogo permite cancelar por Escape e devolve o foco à vaga, ou ao título da composição após adicionar.

A revisão visual não acrescentou dependências ou alterou o catálogo. A troca direta de integrantes continua pendente.

### Rascunhos por modo e limpeza

Dungeon, Raid 10, Raid 20 e Raid 40 mantêm composições independentes em memória e no armazenamento local. A Dungeon mantém também a masmorra escolhida. O link aberto prevalece somente em seu modo; rascunhos antigos continuam recuperáveis. Dados armazenados são validados com o mesmo catálogo e as mesmas restrições dos links compartilhados.

**Limpar composição** pede confirmação, remove somente os integrantes do modo ativo e preserva a masmorra. Cancelar ou pressionar Escape mantém o grupo e devolve o foco ao botão. A confirmação começa em Cancelar e usa os controles de 44 px existentes. A limpeza reinicia as prioridades e a busca; o resultado é anunciado e o botão fica desabilitado no grupo vazio. Isso aplica Zeigarnik (retomada do rascunho), Jakob (confirmação familiar) e Pico e Fim (resultado claro).

Sem acesso ao armazenamento, alternar modos continua preservando grupos durante a sessão e o endereço continua compartilhável. Recarregar nessa condição recupera apenas o grupo no link. Não há sincronização em tempo real entre abas nem recuperação após apagar os dados do navegador.

Validação desta entrega: 29 testes unitários e 11 cenários de navegador; formatação, lint, tipos e build aprovados. Os dois cenários iniciais falharam antes da implementação. A conferência de execução com source maps cobriu 100% das linhas mapeadas de `main.tsx`, `ClearComposition.tsx` e `useCompositionDrafts.ts`; os testes unitários cobrem persistência, migração, validação e limpeza sem mutar o original. A confirmação móvel foi inspecionada em 390 × 844.

## Catálogo Forever 1.60.1.70862

O [JSON versionado](../src/data/forever-data.json) reúne as nove classes, 27 especializações, 32 utilitários e 35 entradas de masmorra mais o perfil geral. As associações registram o que o planejador consegue avaliar com as fontes abaixo. O JSON usa um registro por linha para facilitar a revisão de mudanças no catálogo.

| Dados                                                   | Referência                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classes, nomes e funções das especializações            | [Icy Veins — classes de Forever](https://www.icy-veins.com/wow-forever/all-class-guides), [Blizzard — nove classes](https://worldofwarcraft.blizzard.com/en-us/news/24304075/)                                                                                                                |
| Habilidades treináveis por classe e build de referência | [WoW Handbook — grimório extraído do cliente](https://wowhandbook.com/spellbook/), [Wowhead — habilidades de Forever](https://www.wowhead.com/forever/spells/abilities/shaman)                                                                                                                |
| Rebirth, Kick, Shield Bash e Counterspell               | [Wowhead — Rebirth](https://www.wowhead.com/forever/changes/spellbook/druid/rebirth), [Kick](https://www.wowhead.com/forever/spell=1769/kick), [Shield Bash](https://www.wowhead.com/forever/spell=1672/shield-bash), [Counterspell](https://www.wowhead.com/forever/spell=2139/counterspell) |
| Totens ofensivos, Blessing of Kings e Divine Spirit     | [Blizzard — Mage e Shaman](https://worldofwarcraft.blizzard.com/en-gb/news/24302097), [Blizzard — mudanças de classe](https://worldofwarcraft.blizzard.com/en-us/news/24303313)                                                                                                               |
| Lista de masmorras e interrupção em Wailing Caverns     | [Icy Veins — masmorras](https://www.icy-veins.com/wow-forever/dungeons-overview), [Icy Veins — Wailing Caverns](https://www.icy-veins.com/wow-forever/wailing-caverns-guide/), [Method — veneno em Wailing Caverns](https://www.method.gg/wow-forever/dungeons/wailing-caverns)               |

### Talentos nas builds de referência

- **Marksmanship Hunter** traz Trueshot Aura, que aumenta o poder de ataque à distância de aliados próximos. [Icy Veins — build PvE](https://www.icy-veins.com/wow-forever/marksmanship-hunter-ranged-dps-pve-spec-builds-talents)
- **Discipline Priest** traz Power Infusion na build padrão de Raid. A alternativa que aprofunda Shadow troca esse investimento. [Wowhead — builds de Discipline](https://www.wowhead.com/forever/guide/classes/priest/discipline/talent-builds-pve-healer)
- **Shadow Priest** traz Dark Inspiration para conceder espírito ao grupo. [Wowhead — builds de Shadow](https://www.wowhead.com/forever/guide/classes/priest/shadow/talent-builds-pve-dps)
- **Restoration Shaman** traz Mana Tide Totem para restaurar mana aos aliados próximos. [Icy Veins — build PvE](https://www.icy-veins.com/wow-forever/restoration-shaman-healer-pve-spec-builds-talents)

Essas associações pressupõem as builds de referência. O painel conta os quatro utilitários como bônus em Dungeons e aplica a regra geral de cobertura de Raid.

### Alertas específicos de masmorra

- **Wailing Caverns** prioriza remoção de veneno devido aos efeitos de veneno ao longo da masmorra. [Method — Wailing Caverns](https://www.method.gg/wow-forever/dungeons/wailing-caverns)
- **Shadowfang Keep** prioriza remoção de maldição porque Veil of Shadow reduz a cura recebida. [Icy Veins — Shadowfang Keep](https://www.icy-veins.com/wow-forever/shadowfang-keep-guide)
- **Ruins of Lordaeron** prioriza remoção de veneno devido ao Leech Poison aplicado ao tanque por Witherfang e Viktor the Vile. [Method — Ruins of Lordaeron](https://www.method.gg/wow-forever/dungeons/ruins-of-lordaeron)

As demais entradas usam o perfil geral enquanto suas mecânicas são confirmadas por encontro.

O limite de 15 segundos para interrupção curta é uma escolha do planejador. Windfury e Flametongue compartilham uma categoria, pois são alternativas. Spell Lock e Devour Magic dependem do Felhunter. Feral é oferecido como DPS enquanto o modelo aceitar uma função por especialização. A revisão de talentos por build e dos requisitos de cada encontro ainda está em andamento. Bloodlust/Heroism não entrou nesta versão por falta de confirmação no grimório consultado.
