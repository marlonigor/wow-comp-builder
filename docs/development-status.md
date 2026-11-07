# Estado do desenvolvimento

Atualizado em 07/11/2026. A [especificação original](documenta_o_oficial_wow_forever_comp_builder.md) registra o escopo de produto.

## Como testar

Instale as dependências com `sh bin/setup` ou `npm ci`. Execute `npm run dev` e abra o endereço exibido. Escolha Dungeon ou Raid, adicione especializações e selecione um alerta para conferir a ordem da paleta. Abra a URL em outra aba para recuperar a composição.

Rode `sh bin/check` no Git Bash ou `npm run check` no PowerShell. A validação usa Prettier 3.9.10, ESLint 10.14.0, typescript-eslint 8.72.1, os testes do Node e TypeScript 6.0.3 antes do build. O CI usa o mesmo comando e audita as dependências. Em um clone novo, habilite o gancho com `git config core.hooksPath .githooks`. A varredura de histórico antes do push usa Gitleaks 8.30.1.

## Interface e persistência

- O HTML de referência orientou a mesa tática azul e dourada, a grade de vagas e o painel de cobertura. A montagem continua manual.
- Clique na busca para escolher uma classe pelo ícone e depois uma das três especializações. Os cards têm ícones de especialização, e as vagas preenchidas mostram os ícones de classe e especialização. Os JPEGs vêm do [CDN de ícones do Wowhead](https://wow.zamimg.com/images/wow/icons/large/classicon_druid.jpg) e são servidos junto com a aplicação.
- Pressione `/`, digite `rdruid` e pressione `Enter` para adicionar Restoration Druid à primeira vaga de curador. A busca aceita classe, especialização, atalho ou utilitário. Havendo vários resultados, escolha um card ou refine o termo.
- Passe o mouse ou use `Tab` sobre uma especialização para destacar a vaga de destino. Clique em **Vaga livre** para abrir um seletor filtrado pela função e preencher exatamente aquela posição.
- O seletor da vaga mostra os críticos e bônus que a especialização acrescentaria à composição. Utilitários já cobertos ficam de fora. `Escape` fecha o seletor.
- Em Cobertura tática, os utilitários que o grupo já oferece aparecem em verde com o rótulo **Coberto**.
- O estado fica na URL e no armazenamento local. IDs do protótipo fictício precisam de um novo link. O botão de copiar link está pendente e as proporções de funções nas Raids são provisórias.

## Catálogo Forever 1.60.1.70862

O [JSON versionado](../src/data/forever-data.json) reúne as nove classes, 27 especializações, 28 utilitários e 35 entradas de masmorra mais o perfil geral. As associações registram o que o planejador consegue avaliar com as fontes abaixo. O JSON usa um registro por linha para facilitar a revisão de mudanças no catálogo.

| Dados                                                   | Referência                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classes, nomes e funções das especializações            | [Icy Veins — classes de Forever](https://www.icy-veins.com/wow-forever/all-class-guides), [Blizzard — nove classes](https://worldofwarcraft.blizzard.com/en-us/news/24304075/)                                                                                                                |
| Habilidades treináveis por classe e build de referência | [WoW Handbook — grimório extraído do cliente](https://wowhandbook.com/spellbook/), [Wowhead — habilidades de Forever](https://www.wowhead.com/forever/spells/abilities/shaman)                                                                                                                |
| Rebirth, Kick, Shield Bash e Counterspell               | [Wowhead — Rebirth](https://www.wowhead.com/forever/changes/spellbook/druid/rebirth), [Kick](https://www.wowhead.com/forever/spell=1769/kick), [Shield Bash](https://www.wowhead.com/forever/spell=1672/shield-bash), [Counterspell](https://www.wowhead.com/forever/spell=2139/counterspell) |
| Totens ofensivos, Blessing of Kings e Divine Spirit     | [Blizzard — Mage e Shaman](https://worldofwarcraft.blizzard.com/en-gb/news/24302097), [Blizzard — mudanças de classe](https://worldofwarcraft.blizzard.com/en-us/news/24303313)                                                                                                               |
| Lista de masmorras e interrupção em Wailing Caverns     | [Icy Veins — masmorras](https://www.icy-veins.com/wow-forever/dungeons-overview), [Icy Veins — Wailing Caverns](https://www.icy-veins.com/wow-forever/wailing-caverns-guide/), [Method — veneno em Wailing Caverns](https://www.method.gg/wow-forever/dungeons/wailing-caverns)               |

A remoção de veneno em Wailing Caverns e a remoção de maldição em Shadowfang Keep são alertas específicos do planejador. Em Shadowfang Keep, Veil of Shadow reduz a cura recebida. As outras entradas usam o perfil geral enquanto as mecânicas são confirmadas por encontro. [Icy Veins — Shadowfang Keep](https://www.icy-veins.com/wow-forever/shadowfang-keep-guide)

O limite de 15 segundos para interrupção curta é uma escolha do planejador. Windfury e Flametongue compartilham uma categoria, pois são alternativas. Spell Lock e Devour Magic dependem do Felhunter. Feral é oferecido como DPS enquanto o modelo aceitar uma função por especialização. A revisão de talentos por build e dos requisitos de cada encontro ainda está em andamento. Bloodlust/Heroism não entrou nesta versão por falta de confirmação no grimório consultado.
