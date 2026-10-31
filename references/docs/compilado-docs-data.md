# Compilado dos arquivos de docs e data

Análise do acervo local em 27/10/2026.

## Visão geral

`docs` reúne documentação de formatos eleitorais, exemplos simulados, leitores de arquivos, um guia de conferência e sua interface interativa. Também contém um banco de dados, apesar do nome da pasta sugerir apenas documentação.

`data` reúne arquivos por seção, dados de votação em CSV, relatórios de totalização, uma cópia do banco para consultas e um pacote de consulta pública com abrangência nacional.

O inventário encontrou **56 arquivos em docs** e **1.355.018 arquivos em data**, totalizando **1.355.074 arquivos** e aproximadamente **31,39 GB** de tamanho lógico. A medida inclui cópias, arquivos compactados e arquivos extraídos; não representa volume de dados únicos nem espaço físico efetivamente ocupado.

Os arquivos que se repetem por seção são descritos por padrão e finalidade. Os documentos e componentes de apoio são relacionados individualmente. As contagens referem-se ao momento da inspeção, antes da criação deste relatório, que fica fora das duas pastas inventariadas.

## Como os conjuntos se relacionam

| Pergunta | Fonte mais adequada |
|---|---|
| Como interpretar os arquivos? | Manuais, especificações ASN.1 e scripts em docs/official-knowledgebase. |
| Qual foi o resultado registrado em uma seção? | BU digital da mesma seção, eleição e turno. |
| Como recontar os registros publicados? | RDV, classificado por cargo e categoria, comparado com o BU correspondente. |
| Como conferir integridade e assinaturas? | Arquivo .vsc e os arquivos exatos a que ele se refere. |
| Como consultar a representação impressa? | Conteúdo imgbu/imgbusa; PDFs disponíveis nos exemplos. |
| Como investigar horários e ocorrências? | Logs .jez e manual do ecossistema. |
| Como consultar dados em escala? | SQLite e CSVs, preservando turno, eleição, cargo e versão. |
| Como comparar com a divulgação? | CSV de votação por seção, snapshots JSON e relatórios de totalização. |

BU, RDV, impressão, logs e assinaturas têm funções diferentes. Nenhum deles, isoladamente, substitui todas as demais verificações.

## 1. docs/info e docs/interactive-docs

| Arquivo | O que representa |
|---|---|
| [guia-conferencia-dos-votos.md](</home/ed/andre/repos/vote/docs/info/guia-conferencia-dos-votos.md>) | Guia local de conferência: escolha dos arquivos, nomenclatura, hashes, assinaturas, comparação RDV/BU, impressão, publicação e logs. Documenta um procedimento; não registra sua execução completa. |

| Arquivo | O que representa |
|---|---|
| [README.md](</home/ed/andre/repos/vote/docs/interactive-docs/README.md>) | Explica como abrir, usar e atualizar o guia interativo e suas limitações. |
| [index.html](</home/ed/andre/repos/vote/docs/interactive-docs/index.html>) | Página de entrada e estrutura da interface local de consulta. |
| [app.js](</home/ed/andre/repos/vote/docs/interactive-docs/app.js>) | Implementa navegação, filtros, busca, interpretação de nomes e apresentação das etapas e comandos. Não executa a auditoria exibida. |
| [sources.js](</home/ed/andre/repos/vote/docs/interactive-docs/sources.js>) | Incorpora o texto do guia Markdown e seus metadados para leitura local, inclusive sem servidor. |
| [style.css](</home/ed/andre/repos/vote/docs/interactive-docs/style.css>) | Define layout responsivo e aparência dos componentes do guia. |
| [dark.css](</home/ed/andre/repos/vote/docs/interactive-docs/dark.css>) | Define a base visual do tema escuro. |
| [vendor/marked.umd.js](</home/ed/andre/repos/vote/docs/interactive-docs/vendor/marked.umd.js>) | Biblioteca local que transforma Markdown em HTML para exibição. |
| [vendor/marked.LICENSE.md](</home/ed/andre/repos/vote/docs/interactive-docs/vendor/marked.LICENSE.md>) | Licença do renderizador Markdown; não contém dados eleitorais. |

O guia Markdown ainda contém caminhos antigos para manuais e leitores diretamente sob `docs/`. A interface implementa redirecionamento para `docs/official-knowledgebase` e adaptação dos comandos exibidos. Ao copiar comandos do Markdown original, o prefixo antigo precisa ser corrigido.

## 2. docs/official-knowledgebase: documentos de referência

| Arquivo | O que representa |
|---|---|
| [log-do-ecossistema.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/log-do-ecossistema.pdf>) | Manual de 27 páginas sobre estrutura dos pacotes de log, linhas e categorias de eventos, autenticação, assinatura, carga, habilitação, encerramento e contingências. Explica .jez como pacote ZIP. |
| [manual-do-qr-code-no-boletim-de-urna.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/manual-do-qr-code-no-boletim-de-urna.pdf>) | Manual de 37 páginas para criar leitores do QR code do BU: campos, particionamento dos dados, certificado, hashes e verificação de assinaturas. |
| [tse-ea18-arquivo-auxiliar-de-secao.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf>) | Especificação de 3 páginas do JSON auxiliar de seção: geração, fase, situação, lista de hashes, recebimento e nomes/tipos dos arquivos de urna. Ajuda a localizar arquivos e identificar a situação da versão publicada. |
| [Resumos digitais (hashes) das Eleições 2026 – 1º turno e 2º turnos — Tribunal Superior Eleitoral.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/Resumos digitais (hashes) das Eleições 2026 – 1º turno e 2º turnos — Tribunal Superior Eleitoral.pdf>) | Documento de 4 páginas que explica hashes e relaciona programas e conjuntos de software de urna, PC e totalização. Serve de referência para conferência de software; não é uma tabela de votos nem incorpora os executáveis relacionados. |

### Formatos, leitores e diagramas

| Arquivo | O que representa |
|---|---|
| [README.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf>) | Manual de 14 páginas sobre os arquivos de saída dos sistemas VOTA, SA e RED, nomenclatura, formatos, hashes das tuplas e utilização dos leitores. |

| Arquivo | O que representa |
|---|---|
| [spec/bu.asn1](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1>) | Especificação formal dos tipos, campos e enumerações do Boletim de Urna. |
| [spec/rdv.asn1](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1>) | Especificação formal do Registro Digital do Voto, eleições, cargos, tipos e registros de votos. |
| [spec/assinatura.asn1](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/assinatura.asn1>) | Especificação formal do catálogo de hashes, assinaturas e certificados dos arquivos de resultado. |

| Arquivo | O que representa |
|---|---|
| [python/bu_dump.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/bu_dump.py>) | Decodifica o BU e imprime sua estrutura e conteúdo. |
| [python/rdv_dump.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/rdv_dump.py>) | Decodifica o RDV e imprime sua estrutura completa. |
| [python/rdv_resumo.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/rdv_resumo.py>) | Apresenta identificação e registros do RDV por eleição e cargo, com digitação e tipo do voto. Não produz sozinho a conciliação de totais RDV/BU. |
| [python/assinatura_dump.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/assinatura_dump.py>) | Decodifica e apresenta o conteúdo do arquivo de assinaturas. |
| [python/assinatura_certificado.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/assinatura_certificado.py>) | Extrai o certificado contido no arquivo de assinaturas. |
| [python/assinatura_hash.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/assinatura_hash.py>) | Calcula e compara hashes SHA-512 dos arquivos referenciados e implementa verificações de assinaturas de hardware e do certificado. |
| [python/bu_assinatura_tuplas.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/bu_assinatura_tuplas.py>) | Recalcula a cadeia de hashes das tuplas de votação e verifica a assinatura do hash final do BU. |
| [python/verifica_qrcode.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/verifica_qrcode.py>) | Leitor interativo de textos de QR codes, com interpretação de dados e verificações criptográficas; procura certificados raiz na subpasta certificados. |
| [python/verifica_qrcode_demo.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/verifica_qrcode_demo.py>) | Demonstração de extração de certificado e verificação de assinatura de dados de QR code, com exemplos incorporados. |
| [python/lib/mr_util.py](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/lib/mr_util.py>) | Rotinas compartilhadas de decodificação ASN.1, impressão de estruturas, certificados, chaves e verificações criptográficas. |
| [python/requirements.txt](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/requirements.txt>) | Lista dependências dos leitores: asn1tools, asn1crypto, pyOpenSSL e uma revisão específica de ECPy. |

A subpasta `python/certificados`, esperada por `verifica_qrcode.py`, não está presente. A leitura do código não confirma que todos os leitores estejam prontos para execução neste ambiente. Nenhum validador foi executado nesta análise.

| Arquivo | O que representa |
|---|---|
| [diagramas/bu-class.puml](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/diagramas/bu-class.puml>) | Diagrama PlantUML da estrutura do BU. |
| [diagramas/rdv-class.puml](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/diagramas/rdv-class.puml>) | Diagrama PlantUML da estrutura do RDV. |
| [diagramas/assinatura-class.puml](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/diagramas/assinatura-class.puml>) | Diagrama PlantUML do formato de assinaturas. |
| [diagramas/base.puml](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/diagramas/base.puml>) | Configuração visual e cores compartilhadas dos diagramas. |
| [diagramas/legenda-class.puml](</home/ed/andre/repos/vote/docs/official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/diagramas/legenda-class.puml>) | Legenda de tipos e convenções utilizadas nos diagramas. |

### Exemplos de boletins com QR code

São **10 cenários**, cada um com um PDF para leitura visual e um DAT de conteúdo de impressão: **20 arquivos**. Os nomes usam a fase `s` de simulado; são material de referência para testar leitura e interpretação.

| Cenário | Arquivos | O que representa |
|---|---|---|
| BU_VOTA_UE2013 | [UE2013_s02110ac0139200090110-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2013/UE2013_s02110ac0139200090110-imgbu.pdf>)<br>[UE2013_s02110ac0139200090110-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2013/UE2013_s02110ac0139200090110-imgbu.dat>) | Primeiro turno: impressão gerada no modelo UE2013. |
| BU_VOTA_UE2015 | [UE2015_s02110ac0139200090110-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2015/UE2015_s02110ac0139200090110-imgbu.pdf>)<br>[UE2015_s02110ac0139200090110-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2015/UE2015_s02110ac0139200090110-imgbu.dat>) | Primeiro turno: impressão gerada no modelo UE2015. |
| BU_VOTA_UE2020 | [UE2020_s02110ac0139200090110-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2020/UE2020_s02110ac0139200090110-imgbu.pdf>)<br>[UE2020_s02110ac0139200090110-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2020/UE2020_s02110ac0139200090110-imgbu.dat>) | Primeiro turno: impressão gerada no modelo UE2020. |
| BU_VOTA_UE2022 | [UE2022_s02110ac0139200090110-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2022/UE2022_s02110ac0139200090110-imgbu.pdf>)<br>[UE2022_s02110ac0139200090110-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_VOTA_UE2022/UE2022_s02110ac0139200090110-imgbu.dat>) | Primeiro turno: impressão gerada no modelo UE2022. |
| BU_apuracao_eletronica_pelo_SA | [s02110ac0139200090110-imgbusa.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_apuracao_eletronica_pelo_SA/s02110ac0139200090110-imgbusa.pdf>)<br>[s02110ac0139200090110-imgbusa.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_apuracao_eletronica_pelo_SA/s02110ac0139200090110-imgbusa.dat>) | Primeiro turno: boletim produzido pelo Sistema de Apuração. |
| BU_urna_encerrada_pelo_RED | [RED_s02110ac0139200090110-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_urna_encerrada_pelo_RED/RED_s02110ac0139200090110-imgbu.pdf>)<br>[RED_s02110ac0139200090110-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno1CenarioPadraoEleicoesGerais/BU_urna_encerrada_pelo_RED/RED_s02110ac0139200090110-imgbu.dat>) | Primeiro turno: boletim final após encerramento pelo Recuperador de Dados. |
| BU_T2_VOTA_Presidente | [Pres-T2_s02202ac0139200090013-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente/Pres-T2_s02202ac0139200090013-imgbu.pdf>)<br>[Pres-T2_s02202ac0139200090013-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente/Pres-T2_s02202ac0139200090013-imgbu.dat>) | Segundo turno: cenário com presidente. |
| BU_T2_VOTA_Presidente_Governador | [PresGov-T2_s02200ac0139200090013-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador/PresGov-T2_s02200ac0139200090013-imgbu.pdf>)<br>[PresGov-T2_s02200ac0139200090013-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador/PresGov-T2_s02200ac0139200090013-imgbu.dat>) | Segundo turno: cenário com presidente e governador. |
| BU_T2_VOTA_Presidente_Governador_ConsultaPopular | [PresGovConMunic-T2_s02120ac0139200090013-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador_ConsultaPopular/PresGovConMunic-T2_s02120ac0139200090013-imgbu.pdf>)<br>[PresGovConMunic-T2_s02120ac0139200090013-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador_ConsultaPopular/PresGovConMunic-T2_s02120ac0139200090013-imgbu.dat>) | Segundo turno: presidente, governador e consulta popular. |
| BU_T2_VOTA_Presidente_Governador_Prefeito | [PresGovPrefeito-T2_s18153sp6665603020018-imgbu.pdf](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador_Prefeito/PresGovPrefeito-T2_s18153sp6665603020018-imgbu.pdf>)<br>[PresGovPrefeito-T2_s18153sp6665603020018-imgbu.dat](</home/ed/andre/repos/vote/docs/official-knowledgebase/exemplos-de-boletins-de-urna-com-qr-code/BUsTurno2/BU_T2_VOTA_Presidente_Governador_Prefeito/PresGovPrefeito-T2_s18153sp6665603020018-imgbu.dat>) | Segundo turno: cenário de teste com presidente, governador e prefeito; o PDF traz referência a teste em julho. |

### Banco armazenado junto à documentação

| Arquivo | O que representa |
|---|---|
| [boletins_2turno.sqlite](</home/ed/andre/repos/vote/docs/official-knowledgebase/boletins_2turno.sqlite>) | Banco SQLite da coleta e decodificação de boletins do segundo turno. Seu conteúdo é detalhado abaixo junto à cópia disponível em data. |
| [boletins_2turno.sqlite-wal](</home/ed/andre/repos/vote/docs/official-knowledgebase/boletins_2turno.sqlite-wal>) | Arquivo auxiliar de transações do modo WAL do SQLite; estava com zero bytes na inspeção. Não é uma base eleitoral independente. |
| [boletins_2turno.sqlite-shm](</home/ed/andre/repos/vote/docs/official-knowledgebase/boletins_2turno.sqlite-shm>) | Memória compartilhada/índice de apoio ao modo WAL do SQLite, com 32 KiB na inspeção. Deve ser tratado como arquivo auxiliar do banco. |

## 3. data: banco local e consultas

| Arquivo | O que representa |
|---|---|
| [boletins_2turno.sqlite](</home/ed/andre/repos/vote/data/boletins_2turno.sqlite>) | Cópia independente para consultas, criada por backup SQLite segundo o leia-me. Aproximadamente 2,54 GB; não se atualiza automaticamente junto ao banco de origem. |
| [LEIA-ME-boletins.md](</home/ed/andre/repos/vote/data/LEIA-ME-boletins.md>) | Documenta a origem da cópia, tabelas, campos comprimidos, vínculo entre seções e boletins e exemplos de acesso somente para leitura. |
| [consultas_boletins.sql](</home/ed/andre/repos/vote/data/consultas_boletins.sql>) | Consultas prontas para contagens, amostras de boletins, filtro por UF e identificação de erros de decodificação. |

As consultas realizadas nesta análise confirmaram as seguintes contagens **em cada uma das duas cópias**:

| Tabela | Registros | O que representa |
|---|---|---|
| bus | 499.207 | Boletins e versões obtidas: URL, identificação, situação, hashes, bytes originais comprimidos, decodificação e votos extraídos. |
| sections | 517.179 | Cadastro de seções, UF, município, zona, seção, agregações, auxiliares, estados e tentativas de coleta. |
| config | 28 | Configurações e metadados por UF, com URL, hash, geração, coleta e conteúdo comprimido. |
| events | 114 | Eventos de execução e acompanhamento da coleta; não são os logs internos das urnas. |

Há **499.205 boletins com decodificação ok**, associados à eleição **6258**, e **2 com erro**. As colunas de votos se chamam `votes_13`, `votes_22`, `white_votes` e `null_votes`; o banco é especializado na extração presidencial do segundo turno, não uma tabela completa de todos os cargos.

Os erros registrados estão nos arquivos `o03221zz2956400010091-busa.dat` e `o03221zz3068600010443-busa.dat`. Ambos informam ausência de votos para presidente da eleição 6258 no boletim processado. São erros do fluxo de decodificação registrados no banco; sua causa não foi investigada nesta análise.

O vínculo de consulta é `bus.section_id = sections.id`. Os campos `raw_zlib`, `decoded_zlib` e `aux_zlib` armazenam conteúdo comprimido. A igualdade das contagens entre as cópias não substitui comparação integral dos registros ou dos bytes. A quantidade de seções cadastradas também não pode ser tomada diretamente como quantidade de BUs esperados: é preciso considerar agregações e situações de seção.

## 4. data/votacao_secao_2026_BR

| Arquivo | O que representa |
|---|---|
| [votacao_secao_2026_BR.csv](</home/ed/andre/repos/vote/data/votacao_secao_2026_BR/votacao_secao_2026_BR.csv>) | Tabela nacional de votação por seção: eleição, turno, UF, município, zona, seção, cargo, votável, quantidade de votos e local de votação. Possui 5.731.614 registros, 26 colunas e aproximadamente 1,58 GB. |
| [leiame.pdf](</home/ed/andre/repos/vote/data/votacao_secao_2026_BR/leiame.pdf>) | Leiaute de 5 páginas com definição das colunas, codificação Latin-1, separador ponto e vírgula e convenções de valores ausentes (#NULO/-1 e #NE/-3). |

A varredura completa das colunas de turno, eleição e cargo encontrou:

| Turno | Código da eleição | Registros | Cargo |
|---|---|---:|---|
| 1 | 6257 | 3.800.511 | Presidente |
| 2 | 6258 | 1.931.103 | Presidente |

Apesar do nome nacional, **este CSV específico contém somente o cargo de presidente**. Cada linha representa uma quantidade de votos para um votável em uma seção; não representa um eleitor ou um voto individual identificável.

## 5. data/MG: arquivos de urna do primeiro turno

Pasta: [bu_imgbu_logjez_rdv_vscmr_2026_1t_MG](</home/ed/andre/repos/vote/data/MG/bu_imgbu_logjez_rdv_vscmr_2026_1t_MG>). Contém **260.312 arquivos**, incluindo o leia-me. A contagem por sufixo foi realizada sobre todos os nomes presentes.

| Padrão/arquivo | Quantidade | O que representa |
|---|---|---|
| *-bu.dat | 52.060 | Boletins digitais com os totais por cargo, candidato, partido e categorias de voto, além dos identificadores e informações da seção/urna. |
| *-busa.dat | 2 | Boletins produzidos pelo Sistema de Apuração (SA), em fluxo diferente da apuração regular do VOTA. |
| *-rdv.dat | 52.062 | Registros digitais dos votos por eleição e cargo; permitem recontagem sem revelar a ordem dos votantes. |
| *-imgbu.dat | 52.061 | Conteúdo de impressão do BU, em DAT; não é um PDF ou imagem comum. |
| *-imgbusa.dat | 2 | Conteúdo de impressão dos boletins do SA. |
| *-vota.vsc | 52.060 | Catálogos de hashes e assinaturas dos arquivos produzidos no fluxo VOTA. |
| *-sa.vsc | 2 | Catálogos de hashes e assinaturas dos arquivos do SA. |
| *-log.jez | 52.060 | Pacotes de eventos operacionais das urnas. |
| *-logsa.jez | 2 | Pacotes de eventos do Sistema de Apuração. |
| [leiame.pdf](</home/ed/andre/repos/vote/data/MG/bu_imgbu_logjez_rdv_vscmr_2026_1t_MG/leiame.pdf>) | 1 | Apresentação de BU, RDV, impressão, assinatura e log. |

O conjunto corresponde ao pleito **03220 / primeiro turno**. Foram encontrados 52.060 BUs regulares e 2 BUs do SA, compatíveis em quantidade com as 52.062 seções principais descritas nos relatórios locais; essa igualdade de contagens não é uma validação do conteúdo por seção.

A quantidade de `imgbu.dat` é uma unidade maior que a de BUs regulares. O prefixo adicional é `o03220mg5007500470041`, que também possui arquivos do SA. A presença das duas representações de impressão merece ser considerada ao organizar o conjunto; não demonstra, sozinha, erro de votação.

O leia-me desse pacote descreve compactação 7z para logs, enquanto o manual do ecossistema descreve ZIP. Convém identificar o formato dos bytes de cada pacote antes da extração.

## 6. data/MG: relatórios de totalização do primeiro turno

| Arquivo | O que representa |
|---|---|
| [6257_MG_MINAS-GERAIS_2026_T1_PRESIDENTE.pdf](</home/ed/andre/repos/vote/data/MG/Relatorio_Resultado_Totalizacao_2026_MG/6257_MG_MINAS-GERAIS_2026_T1_PRESIDENTE.pdf>) | Relatório de 148 páginas da eleição federal 6257, para presidente em MG, primeiro turno. Inclui resumo da circunscrição, seções, comparecimento, abstenção, categorias de votos e anexos. Emissão indicada: 15/10/2026. |
| [6259_MG_MINAS-GERAIS_2026_T1.pdf](</home/ed/andre/repos/vote/data/MG/Relatorio_Resultado_Totalizacao_2026_MG/6259_MG_MINAS-GERAIS_2026_T1.pdf>) | Relatório de 438 páginas das eleições estaduais 6259 em MG, primeiro turno. Abrange governador, senador e cargos proporcionais, com resumos e anexos. Emissão indicada: 16/10/2026. |
| [_leiame.pdf](</home/ed/andre/repos/vote/data/MG/Relatorio_Resultado_Totalizacao_2026_MG/_leiame.pdf>) | Documento de uma página que explica o conteúdo do pacote e o padrão do nome dos relatórios: código da eleição, UF, unidade eleitoral, ano, turno e indicação de presidente quando aplicável. |

São documentos de totalização e consolidação. Não substituem os registros individuais do RDV ou os arquivos assinados por seção. As datas e resultados aqui descritos são os declarados nos arquivos locais.

## 7. data/MG: CSVs de análise do segundo turno

| Arquivo | O que representa |
|---|---|
| [boletins_detalhados_mg.csv](</home/ed/andre/repos/vote/data/MG/final--boletins_detalhados_mg.csv/boletins_detalhados_mg.csv>) | Base preparada de análise: 52.062 registros, 56 colunas, cerca de 49,10 MB. Identifica seções, votos nas colunas lula/flavio/brancos/nulos/outros, comparecimento, aptos, horários, urna, software, URLs, hashes e indicadores de conferência. Todos os registros têm pleito 3221. Há 51.054 seções com estado Totalizada e 1.008 com estado Recebida. |
| [versoes_mg.csv](</home/ed/andre/repos/vote/data/MG/final--versoes_mg.csv/versoes_mg.csv>) | Acompanhamento das versões de BUs: 52.062 registros, 13 colunas, cerca de 23,79 MB. Contém URL, identificador da seção, hash, situação inicial/atual, recebimento, tamanho, SHA-256, eleição, seleção e erro. Todos os registros têm eleição 6258, selecionada=1, sha_ok=1 e erro vazio. |

Nos dados inspecionados, cada seção tem `versoes=1` e há 52.062 linhas na tabela de versões: o nome do arquivo indica sua finalidade, mas este retrato não contém várias versões por seção.

Esses CSVs correspondem ao **segundo turno**, com referências a 25/10/2026. São tabelas derivadas: campos como `sha256_confere`, `cache_votos_confere`, `cadeia_hash_confere` e `sha_ok` registram resultados de processamento anterior. Eles não equivalem a verificações refeitas nesta análise.

## 8. data: pacote de consulta pública

Pasta principal: [TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA>).

[LEIA-ME-CONSULTA-PUBLICA.txt](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/arquivos originais/LEIA-ME-CONSULTA-PUBLICA.txt>) declara que BUs, auxiliares, RDVs, catálogos de assinatura, dados abertos e snapshots mantêm os bytes de origem; essa declaração não foi verificada byte a byte nesta análise. O documento informa corte em **27/10/2026 às 00:41:26 UTC** (26/10/2026 às 21:41:26 em Brasília) e complementos de **28.717 de 499.207 seções**.

### Arquivos por seção em 2026/2turno

Pasta: [2026/2turno](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/2turno>). São **1.059.552 arquivos**.

| Padrão | Quantidade | O que representa |
|---|---|---|
| *-bu.dat | 499.178 | Boletins de urna regulares do segundo turno. |
| *-busa.dat | 29 | Boletins do Sistema de Apuração. Somados aos regulares, resultam em 499.207 arquivos de BU. |
| */auxiliares/*.json | 502.911 | Respostas auxiliares por seção e suas versões, com geração, situação, hashes, recebimento e nomes/tipos dos arquivos disponíveis. |
| *-rdv.dat | 28.717 | RDVs coletados para parte do conjunto de seções. |
| *-vota.vsc | 28.717 | Catálogos de assinatura disponíveis para parte do conjunto. |

A estrutura agrupa arquivos por UF, município, zona e seção e por subdiretório de versão/hash. A subpasta `auxiliares` guarda respostas JSON. Como há mais auxiliares do que BUs, uma contagem de JSONs não pode ser tratada como contagem de seções únicas.

Há BU para um conjunto muito maior que o conjunto de RDVs e VSCs: **o pacote local não possui RDV e assinatura para cada BU**. A lista de arquivos anunciada por um auxiliar JSON também não garante que todos tenham sido baixados para o disco.

### Logs com identificadores removidos

[copias-logs-sem-identificadores](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/copias-logs-sem-identificadores>) contém **28.717 pacotes .jez**, aproximadamente **6,34 GB**. O leia-me informa supressão de sequências de identificadores. Portanto, são cópias transformadas para consulta pública e **não podem ser validadas contra a assinatura do log original**. Essa limitação é específica desses logs publicados.

O leia-me menciona um índice técnico separado com hashes de origem/publicação e originais completos mantidos privados. Esse índice não foi encontrado como arquivo separado nas pastas inventariadas; não se deve assumir que ele esteja incluído no pacote local.

### Configurações e snapshots

| Arquivo | O que representa |
|---|---|
| [2026/configuracoes](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/configuracoes>) | 56 JSONs, cerca de 62,93 MB, organizados nos pleitos 3220 e 3221. Relacionam UFs, municípios, zonas, seções e relações entre seções principais e agregadas, com metadados de geração. Funcionam como cadastro/índice para a coleta. |
| [2026/apuracao](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/apuracao>) | 6.340 JSONs de snapshots, cerca de 28,67 MB. A amostra contém eleição, turno, abrangência, geração, candidatos, votos, percentuais, seções, eleitorado, comparecimento e abstenção. São retratos da divulgação em determinado momento; não são BUs individuais nem uma sequência de votos. |

O nome `snapshot-*` sozinho não indica que o conteúdo seja o resultado final de toda a eleição; é necessário verificar os metadados e a abrangência dentro de cada JSON. Os JSONs foram analisados por estrutura e amostras, sem consolidação integral de seus resultados.

### Dados abertos compactados e extração de MG

A pasta [2026/dados-abertos](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos>) contém **28 ZIPs**: 27 recortes por UF, incluindo DF, e um arquivo BR. Cada ZIP lista internamente um CSV e um `leiame.pdf`. A extração local de MG acrescenta um CSV e um PDF, somando **30 arquivos no disco** nesta subpasta. Os arquivos internos dos ZIPs não são somados novamente ao inventário.

| Arquivo | O que representa |
|---|---|
| [votacao_secao_2026_AC.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_AC.zip>) | Dados de votação por seção do recorte AC, com CSV e respectivo leiaute. |
| [votacao_secao_2026_AL.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_AL.zip>) | Dados de votação por seção do recorte AL, com CSV e respectivo leiaute. |
| [votacao_secao_2026_AM.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_AM.zip>) | Dados de votação por seção do recorte AM, com CSV e respectivo leiaute. |
| [votacao_secao_2026_AP.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_AP.zip>) | Dados de votação por seção do recorte AP, com CSV e respectivo leiaute. |
| [votacao_secao_2026_BA.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_BA.zip>) | Dados de votação por seção do recorte BA, com CSV e respectivo leiaute. |
| [votacao_secao_2026_BR.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_BR.zip>) | Dados de abrangência BR; o escopo de cargos e turnos deve ser lido no CSV desta versão. |
| [votacao_secao_2026_CE.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_CE.zip>) | Dados de votação por seção do recorte CE, com CSV e respectivo leiaute. |
| [votacao_secao_2026_DF.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_DF.zip>) | Dados de votação por seção do recorte DF, com CSV e respectivo leiaute. |
| [votacao_secao_2026_ES.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_ES.zip>) | Dados de votação por seção do recorte ES, com CSV e respectivo leiaute. |
| [votacao_secao_2026_GO.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_GO.zip>) | Dados de votação por seção do recorte GO, com CSV e respectivo leiaute. |
| [votacao_secao_2026_MA.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MA.zip>) | Dados de votação por seção do recorte MA, com CSV e respectivo leiaute. |
| [votacao_secao_2026_MG.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MG.zip>) | Dados de votação por seção do recorte MG, com CSV e respectivo leiaute. |
| [votacao_secao_2026_MS.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MS.zip>) | Dados de votação por seção do recorte MS, com CSV e respectivo leiaute. |
| [votacao_secao_2026_MT.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MT.zip>) | Dados de votação por seção do recorte MT, com CSV e respectivo leiaute. |
| [votacao_secao_2026_PA.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_PA.zip>) | Dados de votação por seção do recorte PA, com CSV e respectivo leiaute. |
| [votacao_secao_2026_PB.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_PB.zip>) | Dados de votação por seção do recorte PB, com CSV e respectivo leiaute. |
| [votacao_secao_2026_PE.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_PE.zip>) | Dados de votação por seção do recorte PE, com CSV e respectivo leiaute. |
| [votacao_secao_2026_PI.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_PI.zip>) | Dados de votação por seção do recorte PI, com CSV e respectivo leiaute. |
| [votacao_secao_2026_PR.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_PR.zip>) | Dados de votação por seção do recorte PR, com CSV e respectivo leiaute. |
| [votacao_secao_2026_RJ.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_RJ.zip>) | Dados de votação por seção do recorte RJ, com CSV e respectivo leiaute. |
| [votacao_secao_2026_RN.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_RN.zip>) | Dados de votação por seção do recorte RN, com CSV e respectivo leiaute. |
| [votacao_secao_2026_RO.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_RO.zip>) | Dados de votação por seção do recorte RO, com CSV e respectivo leiaute. |
| [votacao_secao_2026_RR.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_RR.zip>) | Dados de votação por seção do recorte RR, com CSV e respectivo leiaute. |
| [votacao_secao_2026_RS.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_RS.zip>) | Dados de votação por seção do recorte RS, com CSV e respectivo leiaute. |
| [votacao_secao_2026_SC.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_SC.zip>) | Dados de votação por seção do recorte SC, com CSV e respectivo leiaute. |
| [votacao_secao_2026_SE.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_SE.zip>) | Dados de votação por seção do recorte SE, com CSV e respectivo leiaute. |
| [votacao_secao_2026_SP.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_SP.zip>) | Dados de votação por seção do recorte SP, com CSV e respectivo leiaute. |
| [votacao_secao_2026_TO.zip](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_TO.zip>) | Dados de votação por seção do recorte TO, com CSV e respectivo leiaute. |

| Arquivo | O que representa |
|---|---|
| [votacao_secao_2026_MG.csv](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MG/votacao_secao_2026_MG.csv>) | CSV de votação por seção de MG, cerca de 1,78 GB, extraído no pacote. É uma publicação tabular por seção/votável, distinta dos dois CSVs de análise final de MG. |
| [leiame.pdf](</home/ed/andre/repos/vote/data/arquivos originais-20261027T185020Z-1-002/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MG/leiame.pdf>) | Dicionário de dados da extração de votação por seção de MG. |

O CSV BR dentro do ZIP lista tamanho descompactado de **1.052.510.851 bytes**, enquanto o CSV BR da pasta externa tem **1.578.545.088 bytes**. Portanto, os conteúdos desses dois arquivos não são idênticos; nome e ano não bastam para tratá-los como cópias equivalentes. O conteúdo interno de todos os CSVs compactados não foi percorrido nesta análise.

## 9. Cuidados que afetam a interpretação do acervo

1. **Turnos diferentes:** o bruto de MG e os relatórios PDF são do primeiro turno; os CSVs de análise de MG, o banco presidencial e a pasta nacional 2turno são do segundo. O CSV BR externo contém os dois turnos. Não compare linhas sem incluir essa dimensão.
2. **Códigos diferentes:** pleito 3220/3221 e eleição 6257/6258/6259 identificam níveis diferentes. Não devem ser usados como se fossem uma única chave numérica.
3. **Cobertura diferente:** 499.207 arquivos de BU no pacote público não significam 499.207 conjuntos completos de BU, RDV, assinaturas e log. RDVs e VSCs estão presentes para 28.717 casos.
4. **Situação diferente de totalização:** os CSVs preparados de MG ainda registram 1.008 seções como Recebida. A data do retrato e a situação da versão precisam ser preservadas.
5. **Dados derivados:** o SQLite e os CSVs de análise facilitam consultas, mas seus campos e indicadores precisam ser rastreados até os arquivos de origem quando se busca uma conferência independente.
6. **Hashes diferentes:** SHA-256 de coleta/inventário e SHA-512 do formato de assinatura não são diretamente intercambiáveis. Um diretório chamado hash pode ser identificador de versão, não o SHA-256 dos bytes do BU.
7. **Exemplos simulados:** os boletins de demonstração em docs não devem ser agregados aos resultados das pastas de dados.
8. **Sigilo do RDV:** posição do registro não identifica pessoa nem ordem de votação e não deve ser associada a uma linha de log para inferir escolhas individuais.
9. **Documentação não é execução:** os scripts disponíveis e os indicadores de verificações anteriores não demonstram que uma recontagem ou validação completa tenha sido realizada nesta inspeção.

## 10. Escopo da inspeção

Foi feito inventário recursivo de nomes e tamanhos, leitura do guia e dos leia-mes, extração textual dos PDFs relevantes, inspeção de especificações e leitores, leitura das estruturas dos bancos em modo somente leitura, contagem de tabelas e estados de decodificação, varredura dos três CSVs externos para contagens e dimensões selecionadas, leitura de amostras JSON e listagem dos membros dos ZIPs.

Não foram executadas recontagem RDV/BU, validação criptográfica dos arquivos eleitorais, comparação integral entre os bancos, verificação de autenticidade contra fontes externas ou leitura completa de todos os arquivos binários e CSVs internos aos ZIPs. Os relatórios de totalização foram usados para identificar o conteúdo e a abrangência, sem revisão de todas as linhas dos anexos.

Os arquivos de origem não foram editados. Este compilado descreve o que está armazenado e como cada conjunto pode ser utilizado; não atesta a autenticidade, a completude ou o resultado eleitoral do acervo.
