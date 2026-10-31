# Guia interativo: processo técnico do pleito e contratos do TSE

O repositório é independente. `index.html`, JavaScript, estilos, snapshot e texto do guia estão na raiz. Abra `index.html` no navegador para a leitura local, sem instalação ou servidor.

O conteúdo explica preparação, votação, apuração, transmissão, recebimento, totalização e divulgação para desenvolvedores backend. O mapa de relacionamentos apresenta produtor, momento, granularidade e campos de ligação de cadastro, auxiliar, BU, RDV, assinaturas, impressão, resultado agregado e CSV oficial.

## Documentos de apoio

- `references/docs/official-knowledgebase`: manuais, especificações, diagramas, exemplos em PDF e leitores de referência.
- `references/docs/arquivos-tse-info.md`: inventário dos produtos baixados, identificado como descrição local.
- `references/docs/info` e outros Markdown em `references/docs`: documentação complementar.
- `supporting-docs`: PDFs de relatórios e leiautes referenciados no guia.
- `official-references.json`: URLs de documentos e publicações oficiais, com notas de escopo e data de consulta.

Os caminhos de origem em `sources.js` preservam a proveniência do acervo. O mapa `localDocuments` os liga aos arquivos deste repositório. O funcionamento e a publicação não dependem da árvore antiga `vote-pipeline-analysis`.

Os textos locais selecionados estão incorporados integralmente ao leitor. Referências oficiais online abrem no portal do TSE e precisam de rede. Extrações PDF preservam o texto; figuras e diagramação estão nos PDFs originais. As pequenas amostras textuais de produtos já incorporadas ao guia permanecem como material documental, sem publicar conjuntos brutos de votação.

## Publicar no GitHub Pages

1. No repositório do GitHub, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Envie as alterações para `main`.
4. Acompanhe a execução **Publicar how-it-works no GitHub Pages** na aba **Actions**.

O workflow está em `.github/workflows/pages.yml`. Como este repositório contém somente a documentação, qualquer push na `main` prepara e publica o site. Pull requests apenas validam o pacote; também há execução manual.

O workflow executa `scripts/build_pages.py` e publica somente `_site`. São incluídos a interface e os documentos auxiliares permitidos. Ficam fora bancos SQLite e seus arquivos auxiliares, CSV/TSV, ZIP/7z, DAT, VSC e JEZ. Os links dos arquivos originais são adaptados para os anexos publicados. Exemplos DAT podem ser consultados pelo PDF correspondente.

## Preparar uma prévia

Na raiz deste repositório:

```bash
python3 scripts/build_pages.py --output _site
```

A saída precisa ser um diretório novo. Para outra execução, use um caminho diferente em `--output`, preservando a prévia anterior. Abra `_site/index.html` no navegador. `publication-manifest.json` lista arquivos, tamanhos, hashes e fontes excluídas. `_site` e arquivos brutos estão no `.gitignore`.

O empacotamento usa somente Python 3 e os documentos versionados. Não executa atualizações de fontes nem depende de dados ou arquivos externos ao repositório.

## Atualizar o guia

Edite `guia-pleito.md` e, quando necessário, `content.js`. Depois execute:

```bash
python3 build_sources.py
```

O comando atualiza os textos a partir do mapa `localDocuments` e preserva as amostras e os cabeçalhos documentais do snapshot. Se um PDF mudar, a nova extração requer Poppler (`pdftotext`). As notas e datas de consulta online são mantidas em `official-references.json` e não são alteradas automaticamente.

Inclua no commit os arquivos da raiz, `.github/workflows/pages.yml`, `.gitignore`, `scripts`, `references` e `supporting-docs`. Os dados brutos devem permanecer fora do Git.
