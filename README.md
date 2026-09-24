# Landing Page de Captação — Quezada · V01

Página única de captação de leads, construída a partir de `../ANALISE-CONCORRENTES-CONSULTORIA.md` (padrões de copy dos concorrentes) e das regras de `../design-system.md`. **HTML, CSS e JS puros — zero dependências, zero build.**

> **Diferença para o site institucional (`../site/`):** lá a rolagem é conduzida por vídeo (cena presa de 490vh); aqui a rolagem é **nativa**, nenhuma seção fica presa, e há um botão de conversão a cada ~2 telas. O movimento existe para explicar, não para segurar o visitante.

---

## Como abrir

- **Duplo clique em `index.html`** funciona para revisar (o console mostra um aviso de fonte em `file://`, que é inofensivo).
- **Recomendado:** servidor local na pasta, para ver exatamente como vai ao ar:
  ```bash
  python -m http.server 8765
  # abrir http://localhost:8765
  ```
- Publicado na **Vercel** (projeto `quezada-lp`), ligado ao GitHub `tuka-junq/quezada-lp`: cada push na `main` publica sozinho.
- Domínio: **https://quezadaconsultoria.com.br** (o `www` redireciona para ele). DNS no Registro.br: `A @ 76.76.21.21` e `CNAME www cname.vercel-dns.com`.

## Estrutura

```
Landing Page/
├── index.html                  a página
├── politica-de-privacidade.html  RASCUNHO — validar antes de publicar
├── css/style.css               tokens, componentes, movimento, responsivo
├── js/main.js                  comportamento (config no topo do arquivo)
├── assets/
│   ├── img/     *.webp         todas as imagens em WEBP
│   ├── fonts/   *.woff2        Cormorant Garamond + Raleway (variáveis)
│   └── video/   como-ajudamos.mp4  (versão LEGENDADA, 47s, 720p: 35 MB → 5,2 MB)
└── scripts/build-assets.py     regera TODAS as imagens/vídeo a partir dos originais
```

**Regerar os assets:** `pip install pillow imageio-ffmpeg` e `python scripts/build-assets.py`. O script lê os originais em `../site/assets`, `../Logo/PNG` e `../Banco de trafego/`, e grava tudo em `assets/`.

## Peso (medido)

| | Primeira tela | Página inteira rolada |
|---|---|---|
| Desktop 1440px | **309 KB** | ~615 KB |
| Celular 390px | **309 KB** | ~560 KB |

O vídeo (5,2 MB) **só baixa se a pessoa clicar em play**. Site institucional, para comparação: 6,4–10 MB.

---

## As 12 seções (ordem da página)

| # | Seção | Padrão de origem (análise de concorrentes) | Movimento |
|---|---|---|---|
| 1 | **Hero**: "Cresça com a empresa organizada e as costas protegidas." + passos pós-clique + faixa de prova (+30 anos · Método SOL · 2 frentes · 100% online) | Berry (promessa no desejo, risco zero no clique), AG (botão na voz do lead) | Título sobe linha a linha por máscara, foto entra com zoom sutil, parallax leve na rolagem, contadores |
| 2 | **Avalie antes de contratar** — o que costuma acontecer × o que a Quezada entrega | Berry ("o que a maioria entrega, e para por aí") | Coluna antiga é **riscada linha a linha**; coluna Quezada entra da direita |
| 3 | **Sinais** "isso é bom, mas…" + celular com notificações | Mid Falconi | **Notificações chegam uma a uma** no celular, contador sobe até 47, celular flutua |
| 4 | **O que muda** — antes/depois arrastável + 6 transformações | AG, Pavani | **Régua passeia sozinha** uma vez para ensinar o gesto; arrastável e acessível por teclado |
| 5 | **Soluções** — 2 frentes × 4 serviços, cada um com "Para quando" e "Fica" | Berry ("Fica:"), Pavani | No celular vira **abas** (Estrutura e gestão / Jurídico empresarial) |
| 6 | **Como funciona** — 4 passos + mockup do relatório de Diagnóstico | Berry (mostrar o produto), Rampage | **Linha do tempo se preenche com a rolagem**; barras do mapa de exposição crescem |
| 7 | **Planos** por momento da empresa (sem preço), cada um com o seu bloco de **Contencioso** + nota oficial sobre a atuação judicial | Mid Falconi (escada por momento) | Entrada escalonada; plano do meio em destaque |
| 8 | **Quem conduz**: dupla, credenciais, vídeo legendado, livros (**a capa leva à compra do livro físico**: Eduzz e Editora Leader) | Berry (fundador) | Parallax na foto; livros abrem em 3D no hover |
| 9 | **Raio-X Quezada**: 8 perguntas → resultado → WhatsApp | Rampage (M3) | Troca de pergunta deslizando; barras de exposição por área |
| 10 | **Para quem é / não é** | Berry | — |
| 11 | **FAQ** (contador, **sócio quer sair**, advogado, porte, custo, burocracia, fora de SP, sigilo) | Berry + PESQUISA §3.2 (segmento "Societário em Ruptura") | Acordeão com altura animada |
| 12 | **CTA final** — "Você já sabe que a empresa cresceu mais que a estrutura." | Berry (fechamento que assume a decisão) | Selo Q gira devagar com a rolagem |

Extras: **popup do Raio-X** (ver abaixo), **barra fixa no celular** (Raio-X + WhatsApp, some no hero e no fim), **janela de saída** no desktop (1× por sessão, só depois de 8s e nunca para quem já clicou no WhatsApp), **modal de vídeo**, **aviso de cookies** (só aparece se houver Pixel configurado).

### Popup do Raio-X ("Cansado de…")

Foto do Angelson sob o foco de luz + título **"Cansado de"** com o final em **máquina de escrever** (digita, segura 1,7s, apaga letra a letra e digita a próxima, com cursor dourado): *tudo depender de você? · apagar incêndio todo dia? · problemas com processos? · deixar suas férias de lado? · contratos que não protegem? · sócio sem regra combinada? · cliente que não paga?* As frases ficam no atributo `data-phrases` do HTML (separadas por `|`); a altura do card é reservada pela frase mais longa, então nada pula + botão **"Quero fazer o Raio-X"**, que fecha o popup, rola até o Raio-X e já foca a primeira pergunta.

- Aparece **10 segundos** depois de abrir a página (`CONFIG.quizPopupMs`; `0` desliga).
- **1 vez por sessão.** Não aparece para quem já começou o Raio-X, clicou no WhatsApp ou viu a janela de saída.
- Se o vídeo ou a janela de saída estiverem abertos, ou se o Raio-X já estiver na tela, espera e tenta de novo em 6s.
- **No máximo uma interrupção por sessão:** se o popup apareceu, a janela de saída não aparece (e vice-versa).
- Imagens: `popup-angelson.webp` (retrato, desktop) e `popup-angelson-sm.webp` (faixa, celular), geradas de `Mao na cabeça.jpeg`.

Tudo respeita `prefers-reduced-motion`: com a opção ligada no sistema, a página aparece pronta, sem animação.

---

## Como editar

Todas as configurações ficam no topo de `js/main.js`:

```js
const CONFIG = {
  whatsapp: '5511925483835',
  pixelId: '',          // ID do Meta Pixel. Vazio = nenhum cookie, nenhum banner.
  exitIntent: true,
  exitDelayMs: 8000,
};
```

- **Número do WhatsApp:** mude em `CONFIG.whatsapp` **e** nos `href="https://wa.me/..."` do HTML (esses são o fallback caso o JS falhe).
- **Mensagem de cada botão:** atributo `data-wa="..."` no próprio botão, em texto normal (o JS codifica acentos).
- **Perguntas e pesos do Raio-X:** objeto `QUIZ` em `js/main.js`. São 8 perguntas: equipe, faturamento, sócio, contratos, trabalhista, ausência de 15 dias, **momento atual** (gatilhos de compra da pesquisa: sócio entrando/saindo, contratação rápida, venda/investimento, passagem para a família) e maior preocupação. Cada opção soma pontos a uma área (`sociedade`, `contratos`, `trabalhista`, `credito`, `decisoes`, `sucessao`, `patrimonio`). Vence a maior exposição proporcional (`MAX`); empate → a preocupação da última pergunta. "Já tenho um processo" leva à rota urgente. **Ao mudar pesos, recalcule `MAX`.**
- **Textos do resultado:** objeto `AREAS`.

## Links para os anúncios (casar o título com o criativo)

O parâmetro `?angulo=` troca o título e o subtítulo do hero. Sem parâmetro, vale o título padrão.

| `?angulo=` | Título | Usar com o criativo de… |
|---|---|---|
| *(nenhum)* | Cresça com a empresa organizada e as costas protegidas. | institucional, "Como vocês ajudam" |
| `consultoria` | Consultoria organiza a casa. A Quezada organiza e protege o que é seu. | comparação / gap jurídico |
| `dono` | Sua empresa vende. Agora ela precisa crescer sem depender de você. | "Todo dono resolve", "Contratei mais gente" |
| `socio` | Tudo combinado com o sócio na confiança. Até o dia em que a visão muda. | sociedade |
| `contrato` | O contrato que você baixou funciona. Até o dia em que precisa dele. | "Pedindo um contrato", "Contrato não protege" |
| `trabalhista` | A equipe cresceu. A proteção trabalhista cresceu junto? | trabalhista |
| `bombeiro` | Você virou o bombeiro da sua própria empresa. Dá para sair disso. | dependência do dono (linguagem da categoria: "sair do operacional", PESQUISA §5.6.1) |
| `cobranca` | Você entrega, fatura. E o dinheiro não entra? | inadimplência |

Exemplo: `https://quezadaconsultoria.com.br/?angulo=socio&utm_source=meta&utm_campaign=lead_socio&utm_content=AD01`

Se houver `utm_campaign`/`utm_content`, a mensagem do WhatsApp termina com `(ref.: campanha / anúncio)` — quem atende sabe de qual anúncio o lead veio.

## Medição (eventos)

Disparados para o Meta Pixel (se `pixelId` estiver preenchido e o visitante aceitar cookies) e para `dataLayer` (GTM).

| Evento | Quando | Tipo |
|---|---|---|
| `Contact` | Qualquer clique para o WhatsApp (`origem` = qual botão) | padrão Meta |
| `Lead` | Raio-X concluído (`area`, `equipe`, `faturamento`) | padrão Meta — **otimizar campanhas por este** |
| `ViewContent` | Play no vídeo | padrão Meta |
| `quiz_inicio`, `quiz_passo` | Raio-X iniciado / cada resposta | personalizado |
| `popup_raiox_exibido`, `popup_raiox_clique`, `popup_raiox_fechado` | popup do Raio-X | personalizado |
| `aba_frente`, `faq`, `antes_depois`, `janela_saida`, `video_fim`, `cta_click` (inclui `livro_compra`) | interações | personalizado |

> **Recomendação de campanha:** hoje as campanhas [TRÁFEGO] convertem 0,66% e as [LEAD] 2,6%. Com o evento `Lead` do Raio-X, otimize por ele em vez de clique.

---

## ⚠️ Pendências antes de publicar

1. **OAB (assessoria do Angelson):** validar a página inteira — em especial a exibição dos planos, o microcopy *"sem compromisso"*, o Raio-X e a janela de saída. A página **não** traz preço, gratuidade, desconto, "êxito" nem resultado de cliente, de propósito.
2. **Credenciais:** a página não cita mais o Grupo WGL nem usa "ex". Em "Quem conduz" ficou: *"Por 5 anos foi diretor jurídico e de governança (CLO) de um grupo em plena expansão… e hoje integra o Conselho Consultivo"*. Confirmar com o Angelson. Confirmar também o *"+15 anos ministrando aulas"* da Fabiana.
3. **Frases dos sócios:** as citações usadas são as frases-marca registradas em `QUEZADA.md` §4 — confirmar com Angelson e Fabiana.
4. **Prazo de resposta no WhatsApp:** quem atende e em quanto tempo. Lead do Raio-X esfria em horas.
5. **Política de privacidade:** o texto é rascunho — validar.
6. **Meta Pixel:** preencher `pixelId` quando for ao ar.
7. **Imagem de compartilhamento:** o `og:image` usa `og-quezada.jpg` (única imagem fora de WEBP, porque WhatsApp e LinkedIn nem sempre leem WEBP na prévia). Se trocar de domínio, atualizar `canonical`, `og:url` e `og:image` no `<head>`.
8. **Ícone do iPhone:** o iOS não aceita WEBP no `apple-touch-icon`; se quiser o ícone ao "adicionar à tela inicial", incluir um PNG 180×180.
9. **Mockup do relatório** (seção 6) é ilustrativo e está marcado assim na página. Quando houver um relatório real, trocar por uma imagem do sumário (anonimizado).

## Testado (V01)

Chrome desktop 1440px e celular 390px: sem erros de console, sem rolagem horizontal, nenhum travessão no texto, 19 links de WhatsApp com mensagem, `?angulo=` e referência de UTM, comparador, FAQ, abas no celular, Raio-X completo (rota normal, urgente, patrimônio e refazer), links de compra dos livros, modal de vídeo (abre, toca, fecha com Esc), janela de saída e barra fixa do celular.
