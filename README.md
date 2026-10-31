# Guia interativo: processo técnico do pleito e contratos do TSE

Abra `index.html` diretamente no navegador. A navegação, a busca, os capítulos, os textos locais e as interações funcionam offline. Os documentos identificados como referências oficiais online abrem no portal do TSE e precisam de rede.

Entrada nesta instalação: `/home/ed/andre/repos/vote/vote-pipeline-analysis/docs/how-it-works/index.html`.

## Conteúdo

O guia explica a preparação, votação, apuração, transmissão, recebimento, totalização e divulgação, em linguagem voltada a desenvolvedores backend. O mapa de relacionamentos mostra produtor, momento, granularidade e campos que ligam cadastro, auxiliar, BU, RDV, assinaturas, impressão, resultado agregado e CSV oficial.

O inventário de disponibilidade é `../arquivos-tse-info.md`. Ele descreve o pacote baixado e é identificado como inventário local. As regras e os formatos são fundamentados nos manuais, especificações e publicações oficiais indicados nos capítulos.

O escopo da interface é o processo eleitoral e seus produtos oficiais. Os arquivos preexistentes fora desse escopo permanecem em seus diretórios, sem fazer parte da biblioteca ou da busca do guia.

## Proveniência das referências

- **Contrato/manual TSE em cópia local:** texto integral ou extração PDF, com caminho e hash dos bytes locais.
- **Amostra de produto:** JSON completo de uma configuração, de um auxiliar ou de um resultado, identificado com abrangência e caminho próprios.
- **Referência oficial online:** link consultado no portal do TSE e nota de escopo editorial. Não se apresenta a nota como reprodução integral do documento.
- **Inventário local:** descreve os arquivos disponíveis, com suas contagens e contexto de inspeção.
- **Guia explicativo:** texto autoral de organização e explicação técnica baseado nas referências indicadas.

A extração de PDF não reproduz figuras e diagramação. O arquivo original continua acessível pelo leitor. Os exemplos numéricos são ilustrativos. Este guia explica contratos e relações, sem consolidar resultados nem apresentar conclusões sobre o pleito.

## Atualizar

Com Python 3 e Poppler (`pdftotext`) disponíveis, execute:

```bash
python3 /home/ed/andre/repos/vote/vote-pipeline-analysis/docs/how-it-works/build_sources.py
```

O comando atualiza o snapshot de textos locais selecionados, amostras e cabeçalho do CSV oficial de MG. Não acessa serviços eleitorais nem altera os produtos de origem. As notas e URLs das referências oficiais estão em `official-references.json`; sua data de consulta não é atualizada automaticamente por esse comando.

Edite `guia-pleito.md` para revisar os capítulos e `content.js` para revisar o pipeline, o catálogo e as relações. Depois regenere `sources.js`. A atualização do snapshot não reescreve as explicações editoriais.

## Arquivos da interface

| Arquivo | Função |
|---|---|
| `index.html` | Entrada e navegação |
| `guia-pleito.md` | Texto técnico completo, dividido em capítulos |
| `content.js` | Etapas, produtos, chaves e relações dos contratos |
| `app.js` | Leitura, navegação, busca e interações |
| `sources.js` | Snapshot textual gerado, com proveniência e hashes |
| `official-references.json` | URLs oficiais consultadas e notas de escopo |
| `build_sources.py` | Atualização do snapshot da documentação |
| `dark.css` / `style.css` | Tema escuro e layout responsivo |
| `vendor/marked.umd.js` | Renderizador Markdown local, com sua licença no mesmo diretório |

Os textos originais são apresentados sem executar HTML ou código neles contido. A interface não realiza conexões de rede; o leitor pode abrir os links oficiais por ação própria.

Skill utilizada: `../../skills/interactive-docs/SKILL.md`, a partir da raiz de `docs/how-it-works`.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` prepara a publicação de `docs/how-it-works` na raiz do site. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. Pushes na `main` que alteram a documentação ou o empacotador publicam o pacote; pull requests apenas validam o empacotamento. Também é possível disparar o workflow manualmente.

O pacote é montado por `scripts/build_pages.py`, sem executar `build_sources.py` no CI. Ele usa o `sources.js` versionado e os PDFs de apoio em `supporting-docs`. Esses quatro PDFs são cópias documentais de referências que originalmente ficam fora do repositório. O refresh local do snapshot também atualiza essas cópias.

São incluídos a interface, os documentos Markdown auxiliares e os formatos PDF, ASN.1, PlantUML e códigos de referência permitidos da base de conhecimento. Ficam fora os bancos SQLite e seus auxiliares, CSV/TSV, ZIP/7z, DAT, VSC e JEZ. As pequenas amostras textuais já incorporadas ao leitor permanecem na documentação; os arquivos de dados originais não são publicados. Os exemplos DAT podem ser consultados pelos PDFs equivalentes na publicação.

O empacotador valida os hashes dos documentos relacionados ao snapshot e cria um mapa de anexos para que os botões “Abrir arquivo original” funcionem também no Pages. Links para dados excluídos não são exibidos como downloads disponíveis. As referências oficiais online continuam apontando para o portal do TSE.

Para montar uma prévia local, a partir da raiz do repositório:

```bash
python3 scripts/build_pages.py --output _site
```

A pasta de saída precisa ser nova. Para repetir sem remover uma prévia existente, use outro caminho em `--output`. Abra `_site/index.html` no navegador. `publication-manifest.json` relaciona os arquivos, tamanhos, hashes e fontes não publicadas. A pasta `_site` e os dados brutos estão no `.gitignore`.

Inclua no commit `.github/workflows/pages.yml`, `.gitignore`, `scripts/build_pages.py`, `docs/how-it-works` (inclusive `supporting-docs`), os documentos Markdown auxiliares e os arquivos permitidos de `docs/official-knowledgebase`. Os arquivos ignorados de dados brutos devem permanecer fora do Git.
