# Informações sobre os arquivos do TSE

Este documento descreve o diretório `data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026`, inspecionado em 30/10/2026.

O diretório reúne **dados eleitorais de 2026 para consulta e conferência**, desde os arquivos de cada seção até resultados consolidados da apuração. Há material dos dois turnos.

| Pasta | O que representa |
|---|---|
| [2turno](data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/2turno) | Arquivos do segundo turno, organizados por **UF, município, zona e seção**. Contém 499.207 pastas de seções e 1.059.552 arquivos. |
| [apuracao](data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/apuracao) | **6.340 JSONs** com retratos da apuração em diferentes momentos: votos dos candidatos, percentuais, comparecimento, abstenção e andamento da totalização. Inclui disputas para presidente e governador. |
| [configuracoes](data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/configuracoes) | **56 JSONs** com o cadastro de municípios, zonas e seções, incluindo relações entre seções principais e agregadas. Os códigos `3220` e `3221` correspondem, neste acervo, ao primeiro e segundo turnos. |
| [dados-abertos](data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos) | **28 ZIPs** de votação por seção: um por UF e um identificado como `BR`. O pacote de Minas Gerais também está extraído, com um CSV e um `leiame.pdf`. |

Dentro de `2turno`, os tipos de arquivo são:

- **`*-bu.dat` — Boletim de Urna:** totais apurados por candidato e categoria de voto na seção. Existem **499.178**.
- **`*-busa.dat`:** boletins produzidos pelo Sistema de Apuração. Existem **29**, completando os **499.207 boletins**.
- **`*-rdv.dat` — Registro Digital do Voto:** registros que permitem recontar os votos e comparar com o boletim, procedimento descrito pelo [TSE](https://www.tse.jus.br/eleicoes/urna-eletronica/seguranca-da-urna/como-realizar-auditoria). Existem **28.717**.
- **`*-vota.vsc`:** hashes e assinaturas digitais para conferir os arquivos correspondentes. Existem **28.717**.
- **`auxiliares/*.json`:** situação da seção, versões dos conjuntos, recebimento e nomes dos arquivos publicados. Existem **502.911**.

Por exemplo, `ce-13897-0095-0364` identifica **Ceará, município de código eleitoral 13897, zona 0095 e seção 0364**. Os arquivos de resultado são agrupados em subdiretórios de versão/hash; a subpasta `auxiliares` guarda os JSONs de acompanhamento da seção.

O [CSV de Minas Gerais](data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MG/votacao_secao_2026_MG.csv) apresenta uma linha por combinação de seção, cargo e votável, com a respectiva quantidade de votos. Também contém identificadores da eleição, turno, município e local de votação. As primeiras linhas conferidas são do **primeiro turno**.

Os snapshots de apuração são retratos sucessivos e **não devem ser somados entre si**. Os RDVs e arquivos de assinatura disponíveis localmente cobrem **apenas parte das seções**. Um arquivo listado em um JSON auxiliar não necessariamente está presente no disco; a contagem de JSONs auxiliares também não equivale à contagem de seções únicas.

As quantidades e os exemplos acima se baseiam na inspeção do acervo local. A descrição dos formatos também está documentada no [compilado de documentação e dados](vote-pipeline-analysis/compilado-docs-data.md) e no [guia de conferência dos votos](vote-pipeline-analysis/docs/info/guia-conferencia-dos-votos.md). Esta descrição não representa uma validação criptográfica dos arquivos.
