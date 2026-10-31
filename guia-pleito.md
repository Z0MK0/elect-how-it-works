# Pipeline técnico do pleito e contratos dos arquivos do TSE

Guia explicativo para desenvolvedores backend. Revisão: 30/10/2026. A organização segue o processo da Justiça Eleitoral e os contratos publicados pelo TSE. O [inventário arquivos-tse-info.md](../arquivos-tse-info.md) identifica quais produtos estão disponíveis no pacote baixado.

As descrições do processo são apoiadas em manuais, especificações e publicações oficiais, com referência em cada capítulo. Os códigos, caminhos e quantidades do pacote são exemplos do inventário local, identificados como tal. Este texto é uma explicação técnica independente; os documentos do TSE são as fontes dos contratos.

## 01 · Visão de ponta a ponta: o que cada etapa produz

O processo começa com a configuração das eleições e a preparação dos sistemas e urnas. Na seção, a urna registra votos e, ao encerrar, apura o resultado. A mídia de resultado leva os produtos para transmissão. A Justiça Eleitoral recebe e processa resultados para totalização; a divulgação publica diferentes representações desse estado.

```text
Configuração eleitoral → geração de mídias → carga e correspondência da urna
                                                   ↓
                                       abertura / zerésima / votação
                                                   ↓
                                     encerramento e apuração da seção
                                                   ↓
                                 mídia de resultado → transmissão
                                                   ↓
                                  recebimento e processamento dos BUs
                                                   ↓
                                    totalização → divulgação pública
```

VOTA, RED e SA representam caminhos de produção do resultado: votação regular, recuperação e apuração nas modalidades previstas. Eles serão tratados como uma ramificação, e não como uma etapa obrigatória adicional.

### Três escalas de dados

| Escala | Objeto | Arquivos relacionados |
|---|---|---|
| Contexto eleitoral | Eleição, pleito, abrangências e seções | Configurações EA11, EA12 e EA16 |
| Resultado da seção | Registros, totais, operação e assinatura | RDV, BU/BUSA, impressão, log e VSC; auxiliar EA18 |
| Consolidação pública | Resultado por cargo/abrangência em determinada geração | EA20, acompanhamentos EA14/EA15, EA10, dados abertos e relatórios |

### Como interpretar as setas

As setas do pipeline indicam o percurso do processo. As relações entre arquivos têm significados mais específicos: um cadastro identifica uma seção; o auxiliar anuncia produtos; o VSC relaciona assinaturas; o BU contém totais; o RDV permite agrupar registros por categoria. Não se deve ler todo relacionamento como “um arquivo é transformado diretamente no outro”.

A analogia de backend é útil: **identidade do domínio**, **registro detalhado**, **resultado agregado** e **representação pública** são papéis diferentes. Essa é uma forma didática de ler os contratos, sem pressupor qual tecnologia de banco, fila ou serviço o TSE utiliza internamente.

**Fontes:** [manual dos arquivos de saída](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), [TSE: percurso da apuração à divulgação](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/saiba-como-foi-a-totalizacao-dos-votos-no-1o-turno-das-eleicoes-2026), [contratos de divulgação de 2026](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados).

## 02 · Modelo de domínio: identificadores e granularidades

As especificações distinguem `IDProcessoEleitoral`, `IDPleito` e `IDEleicao`. O pleito reúne eleições que ocorrem na mesma data. A eleição identifica um contexto de disputa, turno e abrangência. O cargo identifica a disputa dentro desse contexto.

### Identidade eleitoral e identidade física

| Conceito | Identificador e significado |
|---|---|
| Fase | Simulado, oficial ou treinamento, conforme o contrato |
| Pleito | Identificador do contexto que reúne eleições; aparece no nome dos produtos de urna |
| Eleição | `idEleicao` no BU/RDV e `ele` na divulgação; pode haver várias dentro de um pleito |
| Cargo/consulta | Código constitucional ou código de cargo/consulta livre |
| UF / município | Abrangência e código de município do cadastro eleitoral |
| Zona / seção | Identificação eleitoral; zeros à esquerda fazem parte da representação nos nomes |
| Local de votação | Identificação do estabelecimento, distinta da seção |
| Urna | Equipamento físico, identificado por número interno e dados de carga |
| Carga | Preparação de uma urna, com código, data e identificação do gerador de mídia |
| Conjunto recebido | Identificador `hash` e situação anunciados pelo EA18 |

Uma seção pode agregar outras. O resultado da principal engloba os votos das agregadas, conforme o EA16. O número de identidades cadastrais e o número de resultados publicados, portanto, têm granularidades diferentes. Um histórico de contingência também pode envolver mais de uma urna física para o contexto de uma seção.

### Representações dos códigos

```text
Pleito 3221:   03221 em um nome de resultado; p003221 em nomes JSON de divulgação
Eleição 6258:  6258 no conteúdo; e006258 em nomes JSON
Zona 95:      0095
Seção 364:    0364
```

Os valores acima são exemplos dos arquivos baixados. A documentação de divulgação determina obter os códigos no cadastro correspondente; eles não devem ser calculados por uma regra aritmética entre pleito e eleição.

Para relacionar arquivos de uma seção, acompanhe fase, pleito, UF, município, zona, seção e conjunto recebido. Para relacionar subtotais, acrescente eleição, cargo, categoria e identificação do votável/partido. O número do candidato precisa desse contexto; `sqcand`/`SQ_CANDIDATO` é outro identificador.

**Fontes:** [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1), [EA16 oficial](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-ea16-arquivo-de-configuracao-de-secoes-eleitorais), [inventário dos arquivos](../arquivos-tse-info.md).

## 03 · Preparação: configuração, software, mídias e carga

**Entrada:** definição das eleições, cadastro de seções, eleitores, candidaturas e programas preparados. **Processo:** geração das mídias e preparação da urna para a seção ou para contingência. **Saída:** equipamento com dados e programas carregados, correspondência e dados de carga.

A documentação da Justiça Eleitoral descreve cerimônias de assinatura e lacração dos sistemas, geração de mídias e preparação das urnas. A carga instala o contexto necessário ao funcionamento do equipamento. A correspondência associa a seção ao identificador da urna preparada; ela tem uma representação esperada e uma efetivada.

### O que aparece nos contratos dos arquivos

`CorrespondenciaResultado` combina `identificacao` e `carga`. Esta última inclui:

| Campo | Papel no resultado |
|---|---|
| `numeroInternoUrna` | Identidade do equipamento |
| `numeroSerieFC` | Identificação da mídia de carga |
| `identificadorGeradorMidia` | Máquina, certificado TPM e instalação do gerador |
| `dataHoraCarga` | Momento da carga |
| `codigoCarga` | Código associado à carga e usado no contexto do resultado |
| `numeroSerieFV` em `Urna` | Identificação da mídia de votação |
| `historicoCodigosCarga` | Histórico de cargas registrado no resultado |

As configurações públicas de seções são uma representação cadastral para divulgação. Não são a própria mídia de carga da urna. Da mesma forma, um JSON público que identifica uma seção e um campo ASN.1 que descreve a carga têm papéis diferentes.

### Hash de software e assinatura do resultado

A lista de hashes de programas se refere aos sistemas preparados. O catálogo VSC se refere aos produtos gerados no contexto da urna/apuração. A correspondência se refere ao vínculo entre equipamento, carga e seção. Essas referências se complementam, cada uma sobre um objeto específico.

**Fontes:** [publicação da Justiça Eleitoral sobre preparação e correspondência](https://www.justicaeleitoral.jus.br/urna-eletronica/oportunidades-de-auditoria-e-fiscalizacao.html), [BU ASN.1, Carga e CorrespondenciaResultado](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [manual de logs](../official-knowledgebase/log-do-ecossistema.pdf).

## 04 · Votação: habilitação, registro e sigilo

**Entrada:** urna preparada para o contexto eleitoral. **Processo:** abertura, emissão da zerésima, habilitação e aquisição das escolhas por cargo. **Produtos relacionados:** RDV, dados de comparecimento e eventos operacionais; a zerésima tem conteúdo de impressão próprio.

O manual de logs apresenta eventos de abertura, mesário, habilitação, justificativa e votação. O registro operacional de uma habilitação e o registro de uma escolha são informações com finalidades diferentes.

### Como o voto aparece no RDV

A estrutura do RDV separa eleições e cargos. Cada `Voto` tem `tipoVoto` e uma `digitacao` opcional. O cargo também informa `quantidadeEscolhas`. Os registros permitem recontagem por tipo e votável, preservando essas dimensões.

O manual de processamento descreve a organização dos registros do VOTA e RED por tipo e digitação. A sequência publicada não representa a ordem dos eleitores. No RDV do SA, essa ordenação não é exigida pelo manual. O arquivo publicado também não oferece uma chave para ligar escolhas de cargos diferentes ao mesmo eleitor.

### Zerésima e comparecimento

A zerésima é a representação inicial que mostra a ausência de votos registrados. `imgze.dat` é o tipo de conteúdo impresso descrito no manual. A existência do tipo no contrato não implica que ele esteja em todos os pacotes baixados.

Comparecimento da seção, comparecimento em um grupo de resultado e quantidade de escolhas são grandezas distintas. Uma leitura que iguale a quantidade de registros de qualquer cargo ao comparecimento da seção ignora a configuração e as estruturas do formato.

**Fontes:** [RDV ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1), [manual de processamento, organização do RDV](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), [manual de logs](../official-knowledgebase/log-do-ecossistema.pdf).

## 05 · Encerramento e apuração: da seção à mídia de resultado

**Entrada:** votos registrados. **Processo:** encerramento da aquisição e apuração no equipamento. **Saída:** resultado da seção e produtos preparados para impressão e mídia de resultado.

Apuração é o resultado produzido no contexto da seção; totalização é a consolidação dos resultados das seções. O BU é a representação dos totais apurados, acompanhada da identificação eleitoral e da urna.

```text
                  resultado produzido na seção
             ┌──────────────┼─────────────────────┐
         RDV: registros   BU: totais          log: operação
                             ↓
                      impressão / QR code
             └── hashes e assinaturas em catálogo VSC ──┘
                                 ↓
                          mídia de resultado
```

O catálogo interno de cada VSC determina quais arquivos ele relaciona. A matriz de geração varia entre VOTA, RED e SA. O desenho mostra papéis; não define que todos os arquivos possíveis sejam publicados em cada seção.

### Momento de emissão e momentos de votação

O BU tem `dataHoraEmissao`. `DadosSecao` registra `dataHoraAbertura` e `dataHoraEncerramento`, cujos comentários na especificação descrevem início e término da aquisição do voto. O EA18 registra recebimento. Os JSONs de resultado registram geração e totalização. São tempos de eventos diferentes.

### O conteúdo da mídia

O manual de saída lista BU, RDV, conteúdos de impressão, hashes, assinaturas, logs e tipos auxiliares. A mídia é o meio de levar os produtos aos pontos de transmissão. O conjunto publicamente disponível é um recorte dos produtos previstos e disponibilizados.

**Fontes:** [manual de arquivos de saída](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [TSE: apuração e totalização](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/entenda-a-diferenca-entre-apuracao-e-totalizacao-de-votos).

## 06 · Ramificações de produção: VOTA, RED e SA

O manual de processamento descreve três sistemas capazes de gerar resultados totalizáveis. O produtor e a origem do resultado acompanham a interpretação dos arquivos.

| Caminho | Função | Produtos característicos |
|---|---|---|
| VOTA | Receber o registro das escolhas na urna e gerar o resultado regular | `bu.dat`, `rdv.dat`, `imgbu.dat`, `vota.vsc`, `log.jez` |
| RED | Recuperar dados quando o VOTA não consegue gerar resultado | BU/RDV para totalização; `rdvred.dat` e `red.vsc` no caminho de envio ao SA |
| SA | Apurar modalidades com cédulas ou situações previstas para indisponibilidade/ilegibilidade da mídia | `busa.dat`, `rdv.dat`, `imgbusa.dat`, `sa.vsc`, `logsa.jez` |

### Origem e modalidade são campos diferentes

O RDV do SA acrescenta `tipoCedulaSA` e `origemVotosSA`. A origem pode ser `cedula(1)`, `rdv(2)` ou `bu(3)`. `TipoApuracao` distingue totalmente manual=1, totalmente eletrônica=2, mista BU=3 e mista MR=4.

| `TipoArquivo` | Valor | Contexto |
|---|---:|---|
| `votacaoUE` | 1 | Urna eletrônica |
| `votacaoRED` | 2 | Recuperador de dados |
| `saMistaMRParcialCedula` | 3 | Memória de resultado e cédulas |
| `saMistaBUImpressoCedula` | 4 | BU impresso e cédulas |
| `saManual` | 5 | Votação totalmente manual |
| `saEletronica` | 6 | Apuração eletrônica pelo SA |

Um RDV do SA cuja origem é BU tem uma relação de derivação a partir dos totais de origem. Um RDV com origem em cédula ou RDV tem outra proveniência. A comparação de arquivos precisa preservar essa informação.

O BU também tem o ramo `dadosSecaoSA`: `dadosSecao` contém contexto da seção, enquanto `dadosSA` identifica junta e turma apuradoras e pode registrar a urna de origem. Tipos de urna e histórico de cargas complementam essa identificação.

No fluxo MR + cédulas, o manual prevê repasse de alguns arquivos existentes na MR, como zerésima e arquivos WSQ. A tabela do manual diferencia geração e repasse por modalidade. Os motivos de apuração têm enums próprios; consulte o contrato de BU ou RDV correspondente.

**Fontes:** [manual, matrizes VOTA/RED/SA](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV ASN.1, EleicaoSA e OrigemVotosSA](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1).

## 07 · Transmissão e recebimento do resultado

**Entrada:** mídia de resultado. **Processo:** leitura e transmissão dos arquivos produzidos. **Saída pública relacionada:** arquivos de urna anunciados no auxiliar, com identificação do conjunto e recebimento.

O manual descreve o deslocamento da mídia aos locais de transmissão. O TSE apresenta também o envio a partir de locais de votação com JE-Connect, utilizando VPN e criptografia, com verificação da assinatura antes da leitura. Esse canal de transmissão é uma etapa posterior ao registro dos votos no equipamento.

### Recebimento identifica um conjunto

O EA18 associa a seção a uma lista `hashes`. Cada entrada tem um identificador do conjunto, data/hora de recebimento, situação e nomes/tipos de produtos. As instruções de divulgação definem um diretório de hash a cada recebimento e outro em caso de reenvio.

Assim, “a seção” e “o conjunto de arquivos recebido” são objetos diferentes. A identidade de uma seção permanece, enquanto a publicação pode guardar conjuntos e situações diferentes para seus produtos.

### Correspondência e assinatura

A correspondência vincula o equipamento preparado à seção. A publicação da Justiça Eleitoral descreve pendência quando a correspondência de um resultado não é conhecida, sujeita à liberação e registro previstos. Essa regra não equivale a todos os possíveis motivos de pendência ou rejeição: o EA18 publica estados, sem documentar a implementação completa de cada validação do servidor.

Os arquivos disponibilizados permitem ler identificação, carga, assinatura, situação e recebimento. Eles não expõem, por si, os bancos, filas, transações ou protocolos internos dos serviços de recebimento.

**Fontes:** [manual dos produtos de urna](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), [TSE: transmissão e recebimento](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/saiba-como-foi-a-totalizacao-dos-votos-no-1o-turno-das-eleicoes-2026), [correspondência na Justiça Eleitoral](https://www.justicaeleitoral.jus.br/urna-eletronica/oportunidades-de-auditoria-e-fiscalizacao.html), [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf).

## 08 · Totalização: resultado da seção e consolidação

A totalização recebe resultados apurados e os consolida no contexto da eleição. A publicação do TSE descreve o BU como entrada e o relatório de votação por seção como uma saída que permite comparação.

### O que muda de escala

No BU, o resultado está na seção e contém categorias e votáveis. Na divulgação, as quantidades podem representar uma zona, município, UF ou Brasil. O contexto continua incluindo eleição e cargo. Os resultados por abrangência são representações agregadas sobre o conjunto aplicável de resultados.

```text
Resultados por seção, no mesmo contexto de eleição/cargo
                           ↓
                processamento e totalização
                           ↓
      resultados por abrangência e situações de candidatos
                           ↓
             arquivos públicos de divulgação
```

Somar números é uma parte da consolidação. A destinação dos votos, situação dos resultados e atribuição de eleitos também aparecem nos produtos de divulgação. Por isso, categoria registrada na urna, destinação publicada e condição de eleito pertencem a níveis diferentes do processo.

### Qual conjunto está representado?

O EA18 distingue situação da seção e situação do conjunto/hash. Para interpretar a inclusão de um resultado em uma publicação, preserve essas situações e a geração consultada. Recebimento não deve ser tratado como sinônimo de totalização.

Os relatórios PDF de MG identificam eleição, cargo, turno, circunscrição e emissão. São produtos de consolidação, com resumos e anexos. Eles podem ser lidos em conjunto com os dados por seção, respeitando o contexto e o momento de publicação.

**Fontes:** [TSE: relação entre BU e totalização](https://www.tse.jus.br/eleicoes/urna-eletronica/seguranca-da-urna/auditoria-da-totalizacao), [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [EA20 oficial](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-ea20-arquivo-de-resultado-unificado), relatórios originais na biblioteca.

## 09 · Divulgação: a família de contratos JSON do TSE

A divulgação é a disponibilização pública do resultado e dos produtos relacionados. As instruções de 2026 apresentam contratos para cadastro, acompanhamento, resultados e arquivos de urna. Eles são representações com responsabilidades próprias.

| Contrato | Objeto representado |
|---|---|
| EA11 | Configuração de eleições e parâmetros dos arquivos de divulgação |
| EA12 | Municípios/localidades e abrangências de uma eleição |
| EA16 | Cadastro de seções por pleito e UF, incluindo principal/agregadas |
| EA18 | Auxiliar de uma seção, conjuntos recebidos, situações e produtos |
| EA14 / EA15 | Acompanhamento da totalização em BR / UF |
| EA20 | Resultado unificado por cargo e abrangência |
| EA10 | Resultado de eleitos nas modalidades e cargos definidos no contrato |
| JWS | Representação assinada dos dados JSON de resultado |

### As relações oficiais entre os contratos

```text
EA11: eleições / parâmetros
  ├─ EA12: municípios ───────────────────────→ EA20: resultado
  ├─ EA14 / EA15: acompanhamento
  ├─ EA10: resultado de eleitos, quando aplicável
  └─ EA16: seções → EA18: conjunto recebido → BU / RDV / VSC / log
```

O diagrama é uma relação de identificação e disponibilidade pública. Não representa chamadas internas entre servidores. O campo `arq` do EA11 fornece tipos e diretórios parametrizados; as instruções explicam a hierarquia e as convenções de nome.

A pasta local `configuracoes` contém o cadastro de seções. `apuracao` contém cópias de JSONs de resultado. Esses nomes locais organizam os arquivos baixados; o tipo oficial deve ser reconhecido pela estrutura e pelo contrato correspondente.

**Fontes:** [instruções oficiais de divulgação, seções 3 a 5](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-instrucoes-para-download-dos-arquivos-da-divulgacao-2026), [índice oficial dos contratos](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados).

## 10 · Relacionamento dos arquivos: chaves, cardinalidade e tempo

Uma ligação correta depende do objeto representado e de sua granularidade. O mesmo valor numérico pode significar pleito, eleição, cargo ou votável conforme o campo.

| Relação | Chaves e contexto | Cardinalidade e significado |
|---|---|---|
| EA16 → EA18 | Fase, pleito, UF, município, zona e seção principal | Cadastro identifica a seção; geração do auxiliar é outro evento |
| EA18 → arquivos de urna | Seção + `hashes[].hash` + `arq[].nm`/`tp` | Um conjunto anuncia vários produtos; a lista é metadado de disponibilidade |
| VSC → produtos | Nome em `arquivosAssinados`, bytes e algoritmo declarados | Um catálogo relaciona múltiplos arquivos assinados |
| RDV ↔ BU | Identificação, carga/origem, eleição, cargo, categoria e votável | Muitos registros do RDV correspondem a um subtotal do BU |
| BU ↔ impressão | Identificação, eleição, cargo e subtotal | Duas representações do resultado da seção |
| BU ↔ CSV por seção | Contexto eleitoral, UF, município, zona, seção, cargo e votável/categoria | Um BU pode corresponder a várias linhas tabulares |
| Seções ↔ EA20 | Eleição, cargo, abrangência e momento | Um resultado público agrega dados na abrangência; não é um BU |
| JSON ↔ JWS | Mesmo tipo de resultado, contexto e geração aplicável | O JWS transporta payload assinado; assinatura se refere aos bytes do formato |

### Chave semântica de um subtotal

```text
fase + pleito + eleição + UF + município + zona + seção principal
     + conjunto/origem + cargo + categoria + votável/partido
```

É uma lista das dimensões que precisam ser conciliadas. Os arquivos não possuem todos esses campos na mesma posição nem usam a mesma representação: parte do contexto pode vir do caminho, do cadastro, do auxiliar ou de estruturas superiores.

### Granularidades que não são intercambiáveis

Um registro no RDV descreve uma escolha/categoria no cargo. Uma tupla do BU traz uma quantidade. Uma linha do CSV traz uma quantidade tabular. Um JSON agregado traz o estado de uma abrangência. Um snapshot é uma cópia desse estado em uma geração. Dois snapshots sucessivos não são parcelas de uma soma.

### Tempo faz parte do relacionamento

Carga, aquisição do voto, emissão do BU, recebimento, totalização e geração têm relógios e campos próprios. Uma mudança de geração não deve ser interpretada como nova votação. Um arquivo de abrangência também não fornece a ordem individual de chegada de cada seção.

**Fontes:** [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1), [assinatura ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/assinatura.asn1), [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [inventário dos produtos disponíveis](../arquivos-tse-info.md).

## 11 · Contrato binário do BU: envelope e resultado

ASN.1 descreve os tipos; BER codifica os valores em bytes. `SEQUENCE` representa uma estrutura, `CHOICE` uma alternativa tipada e `ENUMERATED` um domínio de valores nomeados. Um campo `OPTIONAL` pode estar ausente conforme o contrato.

O BU contém `EntidadeEnvelopeGenerico`. Seu `conteudo` é uma sequência de bytes que representa `EntidadeBoletimUrna`. Ler o envelope e ler a entidade são dois níveis de decodificação.

```text
EntidadeEnvelopeGenerico
  ├─ cabecalho, fase, identificacao, tipoEnvelope
  └─ conteudo → EntidadeBoletimUrna
      ├─ urna, identificacaoSecao, dataHoraEmissao
      ├─ dadosSecaoSA, qtdEleitoresCompareceram
      ├─ detalhamentoComparecimento (opcional)
      ├─ historicoCodigosCarga
      └─ resultadosVotacaoPorEleicao[]
          ├─ idEleicao e quantitativos de aptos
          ├─ resultadosVotacao[]
          │   ├─ tipoCargo, qtdComparecimento
          │   └─ totaisVotosCargo[]
          │       ├─ codigoCargo, ordemImpressao
          │       └─ votosVotaveis[]
          │           ├─ tipoVoto, quantidadeVotos
          │           ├─ identificacaoVotavel (quando aplicável)
          │           └─ ordemGeracaoHash, hash
          └─ ultimoHashVotosVotavel e assinatura
```

### Cabeçalho e identidade

`IDEleitoral` é um CHOICE entre identificador de processo, pleito ou eleição. O valor precisa ser interpretado junto com a alternativa selecionada. A identificação do envelope e a identificação da seção na entidade também devem ser lidas em seus respectivos níveis.

### Aptos e comparecimento

A especificação define `qtdEleitoresAptos = qtdEleitoresAptosSecao + qtdEleitoresAptosTTE`. O total inclui aptos originais da seção e temporários. `qtdEleitoresCompareceram` é um campo da entidade do BU; `qtdComparecimento` pertence ao grupo de resultado. As grandezas não devem ser substituídas uma pela outra apenas porque possuem valores iguais em um exemplo.

### A tupla de total

`TotalVotosVotavel` tem tipo, quantidade, identificação opcional, ordem e hash. O cargo está no nível superior. Para branco e nulo, a identificação do votável é omitida. `IdentificacaoVotavel` contém `codigo` e `partido`; a interpretação depende do cargo e do tipo de voto.

A extensão `.dat` não é um schema. O produto deve ser identificado pelo sufixo completo e pelo tipo interno correspondente. A presença de campos genéricos em uma especificação não indica que sejam utilizados em todas as eleições.

**Fontes:** [bu.asn1 completo](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [manual do formato](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), diagrama `bu-class.puml` na biblioteca.

## 12 · Contrato do RDV: registros, enums e escolhas

O tipo raiz publicado é `EntidadeResultadoRDV`, com cabeçalho, urna e `rdv`. `EntidadeRegistroDigitalVoto` contém pleito, fase, identificação da seção, histórico de cargas e eleições.

```text
EntidadeResultadoRDV
  └─ rdv → eleicoes
      ├─ eleicoesVota[] → idEleicao → votosCargos[]
      └─ eleicoesSA[] → idEleicao, tipoCedulaSA, origemVotosSA → votosCargos[]
          └─ idCargo, quantidadeEscolhas, votos[]
              └─ tipoVoto, digitacao (opcional)
```

### Tipo de voto é um enum de cada contrato

| Categoria | Código RDV | Código BU |
|---|---:|---:|
| Nominal | 2 | 1 |
| Legenda | 1 | 4 |
| Branco | 3 | 2 |
| Nulo | 4 | 3 |
| Branco após suspensão | 5 | Sem enumeração separada com o mesmo nome |
| Nulo após suspensão | 6 | Sem enumeração separada com o mesmo nome |
| Nulo por repetição | 7 | Sem equivalência automática definida por esta tabela |
| Nulo cargo sem candidato | 8 | BU prevê `cargoSemCandidato(5)`; interpretar a regra de representação |
| Nulo após suspensão cargo sem candidato | 9 | Interpretar a regra de representação do resultado |

O relacionamento usa significado, e não igualdade numérica do enum. Os tipos especiais devem conservar sua classificação até que a regra aplicável de representação seja estabelecida. A tabela não define um agrupamento automático de todos eles em nulo comum.

`digitacao` está ausente por contrato nos tipos RDV 3, 5, 6, 8 e 9. Um número digitado em registro classificado como nulo continua pertencendo à categoria nulo. `quantidadeEscolhas` é o limite de escolhas do cargo e faz parte da interpretação dos registros.

### Cargos e consultas

O enum constitucional identifica presidente=1, vice-presidente=2, governador=3, vice-governador=4, senador=5, deputado federal=6, deputado estadual=7, deputado distrital=8, primeiro suplente=9, segundo suplente=10, prefeito=11, vice-prefeito=12 e vereador=13. O domínio enumera possibilidades; não afirma que todas sejam votadas em cada arquivo.

O CHOICE de cargo também prevê cargo/consulta livre, com números de 25 a 99. `TipoCargoConsulta` no BU distingue majoritário=1, proporcional=2 e consulta=3. O campo de fase ASN.1 distingue simulado=1, oficial=2 e treinamento=3.

### Dos registros aos subtotais

Separe eleição e cargo. Classifique os registros pelo tipo. Agrupe nominais por candidato e legenda por partido; preserve as demais categorias. Relacione os subtotais ao contexto e às categorias correspondentes no BU. A ordenação do RDV publicado não representa uma sequência cronológica de votação.

**Fontes:** [rdv.asn1 completo](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1), [bu.asn1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [manual, RDV](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf).

## 13 · Integridade: catálogo VSC e cadeia de tuplas do BU

Hash é um resumo dos bytes segundo um algoritmo. Assinatura digital relaciona uma mensagem/resumo à chave e ao algoritmo previstos. Certificado e informação de chave dão contexto à validação. A assinatura é uma propriedade distinta da situação de totalização publicada.

### Estrutura do VSC

```text
EntidadeAssinaturaEcourna
  ├─ assinaturaSW: EntidadeAssinatura
  ├─ assinaturaHW: EntidadeAssinatura
  └─ origemAssinaturaHW: modelo e algoritmo

EntidadeAssinatura
  ├─ dataHoraCriacao, versao
  ├─ autoAssinado, conteudoAutoAssinado
  └─ informacaoChave: tag ou certificado

conteúdo de assinatura → arquivosAssinados[]
  └─ nomeArquivo, hash, assinatura
```

O nome em `arquivosAssinados` estabelece a relação com cada produto. O algoritmo e a representação são parte da referência: comparar resumos exige os mesmos bytes e algoritmo. O enum do contrato inclui SHA-1, SHA-256, SHA-384 e SHA-512, com SHA-512 indicado como padrão.

O `hash` do EA18 identifica um conjunto recebido. Ele organiza a localização dos produtos e tem papel distinto do hash criptográfico interno de cada arquivo no VSC. Os nomes `vota.vsc`, `sa.vsc` e `red.vsc` correspondem aos caminhos de geração previstos no manual.

### Cadeia de tuplas

O BU possui outra estrutura de integridade. Para cada eleição, o cabeçalho de encadeamento combina pleito, eleição, município, zona, seção e código de carga. Cada bloco acrescenta o hash anterior e os campos de totalização da tupla.

```text
contexto da eleição → hash inicial
hash anterior + ordem + cargo + tipo + quantidade + identificação → próximo hash
último hash → assinatura do hash final, armazenada no resultado por eleição
```

O manual determina preenchimento e ordem: cabeçalho com larguras fixas, hash anterior em hexadecimal maiúsculo, cargos por `ordemImpressao` e blocos por `ordemGeracaoHash`. A ordem dos blocos reinicia em cada cargo; o encadeamento está ligado ao contexto da eleição. Branco e nulo omitem os campos de identificação do votável.

Catálogo de arquivos e cadeia das tuplas operam sobre objetos diferentes: bytes de produtos e composição estruturada dos totais. O resultado de uma leitura do formato não substitui as verificações criptográficas previstas.

**Fontes:** [assinatura.asn1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/assinatura.asn1), [BU ASN.1, TotalVotosVotavel](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [manual, formação dos hashes](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf).

## 14 · EA16 e EA18: cadastro, agregação e versões recebidas

EA16 descreve o cadastro público de seções para um pleito e UF. EA18 descreve produtos recebidos para uma seção. Cadastro e disponibilidade do resultado são contratos diferentes.

### Cadastro de seções

```text
EA16 → cdp, f, dg, hg, idg
  └─ abr[] → mu[] → zon[] → sec[]
      └─ ns, nsp (se agregada), nsa[] (se principal com agregadas), da, ha
```

No EA16, `nsp` identifica a principal de uma agregada; `nsa` lista agregadas da principal. `da` e `ha` são data/hora do auxiliar e ficam disponíveis para a principal após sua geração. Esses campos não são o horário da votação.

### Auxiliar da seção

| Campo EA18 | Significado |
|---|---|
| `dg`, `hg`, `idg` | Geração do JSON |
| `f` | Fase, `s` ou `o` |
| `st` na raiz | Situação da seção |
| `hashes[].hash` | Identificador do conjunto recebido |
| `hashes[].dr`, `hr` | Data/hora do recebimento |
| `hashes[].st` | Situação do conjunto/hash |
| `hashes[].arq[].nm`, `tp` | Nome e tipo do produto anunciado |

Antes do recebimento, o manual informa ausência de JSON. Com arquivos recebidos, a seção está **Recebida** e o hash **Recebido**. Após a totalização final, a seção pode estar **Não instalada**, **Não apurada**, **Anulada** ou **Totalizada**. O hash pode estar **Rejeitado**, **Excluído** ou **Totalizado**. Esses são domínios separados; a especificação não apresenta uma matriz completa de todas as combinações ou causas.

### Nomes e subdiretórios

O auxiliar oficial usa `p<pleito de 6 dígitos>-<uf>-m<município>-z<zona>-s<seção>-aux.json`. Os produtos de urna usam `fpppppuuMMMMMZZZZSSSS-suf.ext`, com pleito de cinco dígitos. No pacote baixado, as cópias do auxiliar aparecem em `auxiliares/*.json`.

A lista anunciada pelo servidor e a presença no pacote baixado são informações distintas. O inventário registra mais auxiliares do que BUs; essa quantidade não representa seções únicas. O exemplo de CE está incorporado integralmente na biblioteca de fontes.

**Fontes:** [EA16 oficial](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-ea16-arquivo-de-configuracao-de-secoes-eleitorais), [EA18 completo](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [inventário do pacote](../arquivos-tse-info.md).

## 15 · EA20: estado agregado, andamento e finalização

O resultado unificado identifica eleição, turno, fase, abrangência e geração. Os grupos `carg`, `s`, `e` e `v` representam cargos, seções, eleitorado e votos; consulta popular usa a estrutura própria `perg`.

### Campos de estado

| Campo | Leitura no contrato de 2026 |
|---|---|
| `and` | Andamento: `n`, `p` ou `f` |
| `tf` | Existência de totalização final: `s` ou `n` |
| `md` | Definição matemática para os cargos e condições previstas |
| `dv` | Condição de divulgação dos votos presidenciais |
| `dg` / `hg` | Geração do arquivo |
| `dt` / `ht` | Totalização representada |

`and=f` e `tf=s` têm significados diferentes. Em uma abrangência de eleição geral, a conclusão das seções pode ocorrer antes da totalização final. `dv=n` pode representar votos ainda não divulgados, apresentados como zero pelo contrato. Os indicadores não devem ser deduzidos apenas de percentuais.

A hierarquia de cargo inclui agremiações, partidos e candidatos. Número na urna, `sqcand`, destinação do voto e condição de eleito são campos distintos. Um snapshot é o estado de uma abrangência em sua geração, não um lote incremental. Identificadores de geração de documentos diferentes também não estabelecem um snapshot transacional único entre eles.

**Fontes:** [EA20, estrutura e dicionário](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-ea20-arquivo-de-resultado-unificado), [FAQ oficial de divulgação](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados), amostra JSON completa nas fontes.

## 16 · Dados abertos: CSV de votação por seção

O CSV de votação por seção é uma publicação tabular dos resultados. Sua unidade de linha é uma combinação de contexto eleitoral, seção, cargo e votável, com `QT_VOTOS` indicando a quantidade. Uma linha não identifica um eleitor.

### Contrato tabular

O leiaute informa codificação Latin-1, separador `;` e convenções de ausência/não aplicação como `#NULO`/`-1` e `#NE`/`-3`. Essas convenções devem ser lidas no dicionário dos campos.

| Grupo | Campos do CSV disponível |
|---|---|
| Geração | `DT_GERACAO`, `HH_GERACAO` |
| Contexto eleitoral | `ANO_ELEICAO`, `CD_TIPO_ELEICAO`, `NM_TIPO_ELEICAO`, `NR_TURNO`, `CD_ELEICAO`, `DS_ELEICAO`, `DT_ELEICAO`, `TP_ABRANGENCIA` |
| Território | `SG_UF`, `SG_UE`, `NM_UE`, `CD_MUNICIPIO`, `NM_MUNICIPIO`, `NR_ZONA`, `NR_SECAO` |
| Cargo e resultado | `CD_CARGO`, `DS_CARGO`, `NR_VOTAVEL`, `NM_VOTAVEL`, `QT_VOTOS`, `SQ_CANDIDATO` |
| Local de votação | `NR_LOCAL_VOTACAO`, `NM_LOCAL_VOTACAO`, `DS_LOCAL_VOTACAO_ENDERECO` |

### Ligação com os arquivos de urna

`CD_ELEICAO` se relaciona ao contexto `idEleicao`; `CD_CARGO` ao cargo correspondente. Município, zona e seção identificam a unidade eleitoral. `NR_VOTAVEL` deve ser lido com categoria e descrição: uma opção especial de branco/nulo não é interpretada como candidatura apenas por ser numérica.

`SQ_CANDIDATO` e `sqcand` da divulgação representam o sequencial da candidatura. O número de urna e o sequencial não devem ser confundidos. Nos binários, a identificação do votável está sob a estrutura de cargo e tipo; a correspondência precisa conservar essas dimensões.

### ZIP, CSV e leiaute

Os ZIPs por UF e BR incluem o CSV e um `leiame.pdf`. O pacote de MG tem uma extração com 26 colunas. O inventário informa primeiras linhas de primeiro turno; isso descreve essa amostra, não o conteúdo integral de todos os arquivos. A abrangência do nome e as dimensões presentes no conteúdo são informações complementares.

O cabeçalho real do CSV de MG está disponível nas fontes como extração de estrutura. A tabela de dados permanece em seu arquivo original, ligada pelo catálogo.

**Fontes:** [leiaute do CSV de MG](../../../data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/dados-abertos/votacao_secao_2026_MG/leiame.pdf), [inventário de arquivos oficiais baixados](../arquivos-tse-info.md), [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1).

## 17 · Impressão e QR code: outra representação do resultado

`imgbu.dat` e `imgbusa.dat` contêm a representação para impressão do BU, em formato próprio. A extensão DAT não significa PDF, PNG ou JPEG. Nos exemplos de documentação, o PDF é uma apresentação visual adicional do mesmo cenário.

O boletim impresso reúne identificação e totais. O QR code carrega uma representação digital de dados e elementos definidos no protocolo próprio do manual. Dependendo do conteúdo, o BU e o certificado são divididos em partes.

### Como as representações se relacionam

```text
BU digital: estrutura ASN.1 com identificação e totais
       ↕ contexto / eleição / cargo / categoria / quantidade
Impressão: identificação e totais em representação legível
       ↕ protocolo de campos, partes e assinatura
QR code: texto codificado para captura e interpretação
```

A leitura de QR code exige reunir as partes necessárias, preservar a representação dos dados e interpretar certificado, modelo e algoritmos previstos. Ela tem contrato próprio, distinto da decodificação ASN.1 do BU.

### Os exemplos de documentação

Os cenários de primeiro turno mostram modelos UE2013, UE2015, UE2020 e UE2022, além de SA e RED. Os de segundo turno mostram combinações de presidente, governador, consulta popular e prefeito. Cada cenário tem PDF e DAT. A fase `s` identifica que são exemplos simulados.

Eles permitem observar a variação de representação por cenário e modelo. A biblioteca mantém cada PDF e DAT de demonstração identificado como exemplo, separado das famílias de resultados do pacote de segundo turno.

**Fontes:** [manual de QR code](../official-knowledgebase/manual-do-qr-code-no-boletim-de-urna.pdf), [manual de arquivos de saída](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf), exemplos de impressão na biblioteca.

## 18 · Logs: trilha operacional da urna

O manual do ecossistema descreve JEZ como pacote ZIP. O arquivo corrente da urna é `logd.dat`; o pacote exportado pode conter logs arquivados, inclusive históricos associados a contingência e troca de mídia/equipamento.

### O que uma linha representa

O formato de linha contém data/hora, categoria de severidade, identificação de urna/aplicação e mensagem, conforme o layout do manual. Uma mensagem deve ser lida no contexto da aplicação que a produziu. Há exemplos de carga, testes, emissão de zerésima, habilitação, justificativa, encerramento e procedimentos de contingência.

`log.jez` e `logsa.jez` identificam produtos operacionais de caminhos distintos. O manual também apresenta os logs dos aplicativos do ecossistema e seus mecanismos de arquivamento, autenticação e assinatura.

### Relação com BU e RDV

Os logs explicam eventos operacionais e seus horários. O BU descreve o resultado e metadados da urna; o RDV publicado organiza registros de voto por cargo, tipo e digitação. A sequência de eventos do log não fornece uma chave para atribuir escolhas do RDV a pessoas.

A descrição de autenticação e assinatura se refere ao arquivo original e seus bytes. Uma representação transformada ou um trecho de texto extraído possui outro conteúdo binário. O manual detalha quais estruturas e autenticadores pertencem ao pacote de origem.

No inventário solicitado, os auxiliares podem anunciar um log mesmo quando esse produto não integra o subconjunto de arquivos efetivamente baixados. A lista anunciada e a lista presente no pacote devem ser interpretadas separadamente.

**Fontes:** [manual completo do ecossistema](../official-knowledgebase/log-do-ecossistema.pdf), [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [inventário de disponibilidade](../arquivos-tse-info.md).

## 19 · Como os arquivos baixados se encaixam no processo

A base deste mapa é [arquivos-tse-info.md](../arquivos-tse-info.md), inspecionado em 30/10/2026. As quantidades abaixo descrevem o pacote local e não são contadores do sistema eleitoral em tempo real.

Raiz dos produtos disponíveis:

```text
data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA/2026/
  ├─ configuracoes/      cadastro de seções por pleito e UF
  ├─ 2turno/             produtos e auxiliares por seção
  ├─ apuracao/           cópias de resultados agregados
  └─ dados-abertos/      ZIPs de votação por seção e extração de MG
```

| Família disponível | Contagem do inventário | Papel no processo |
|---|---:|---|
| BUs regulares | 499.178 | Totais apurados nas seções |
| BUs do SA | 29 | Totais produzidos pelo caminho SA |
| RDVs | 28.717 | Registros digitais por cargo |
| VSCs | 28.717 | Catálogos de hashes e assinaturas |
| Auxiliares JSON | 502.911 | Situação, conjuntos recebidos e produtos anunciados |
| Configurações JSON | 56 | Cadastro de seções dos pleitos 3220 e 3221 |
| Snapshots de apuração | 6.340 | Retratos por abrangência e cargo, incluindo presidente e governador |
| ZIPs de dados abertos | 28 | Distribuição por UF e BR, com CSV e leiaute |

### Relação entre a organização local e o contrato

`ce-13897-0095-0364` reúne UF, município eleitoral, zona e seção. Os subdiretórios de versão/hash agrupam produtos recebidos. `auxiliares` reúne respostas JSON dessa seção. `snapshot-*` é o nome da cópia de um resultado; os campos internos identificam o contrato e a abrangência.

Os diretórios do pacote não devem ser confundidos com a árvore HTTP oficial, descrita nas instruções de divulgação. A árvore HTTP separa arquivos por ambiente, ciclo, eleição ou pleito conforme o produto, e usa nomes padronizados de configuração e resultados.

O conjunto disponível contém 499.207 boletins, enquanto RDV/VSC cobrem um subconjunto. Essa diferença é de disponibilidade do pacote. Um produto descrito no manual, anunciado no auxiliar e presente no diretório são três condições diferentes.

**Fontes:** [inventário completo fornecido](../arquivos-tse-info.md), [instruções oficiais de organização dos produtos](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-instrucoes-para-download-dos-arquivos-da-divulgacao-2026).

## 20 · Exemplo de ponta a ponta: uma seção e seus produtos

O exemplo usa a identificação realmente presente `ce-13897-0095-0364`, no pacote de segundo turno. Ele ensina os vínculos; os valores de votação não são reproduzidos nem consolidados aqui.

1. **Contexto:** fase oficial, pleito 03221, UF CE, município eleitoral 13897, zona 0095, seção 0364.
2. **Cadastro:** EA16 organiza UF → município → zona → seção, com possíveis vínculos de agregação e geração do auxiliar.
3. **Resultado da seção:** o produtor gera os arquivos de resultado. O nome do BU anunciado é `o03221ce1389700950364-bu.dat`.
4. **Recebimento:** o EA18 da amostra publica `st=Totalizada` na raiz e `hashes[].st=Totalizado` para o conjunto anunciado. Guarda também recebimento e geração.
5. **Produtos anunciados:** a amostra relaciona BU, VSC, RDV e log. O anúncio descreve produtos na fonte; a presença de cada um no pacote é outra informação.
6. **Contrato do BU:** eleição → grupo de resultado → cargo → tipo e votável → quantidade.
7. **Contrato do RDV:** eleição → cargo → registros com tipo e digitação; a correspondência com o BU usa o significado das categorias.
8. **Contrato de assinatura:** VSC relaciona nomes de arquivo a hashes e assinaturas. A cadeia do BU relaciona suas tuplas e contexto eleitoral.
9. **Divulgação agregada:** o resultado da abrangência representa totais e estados da eleição/cargo em determinada geração. A identidade de uma seção não deve ser procurada como se um EA20 fosse uma lista de BUs.
10. **Dados abertos:** a representação tabular por seção organiza contexto, cargo, votável e quantidade. Compare apenas linhas com a mesma eleição, turno e demais dimensões aplicáveis.

O cadastro de AC e o snapshot de PI incluídos na biblioteca são amostras independentes de seus contratos. Eles não pertencem à seção CE deste exemplo. Os caminhos e metadados de cada amostra permanecem visíveis no leitor.

### Exercício com valores fictícios

Para um único cargo com uma escolha e sem categorias especiais, quatro registros para A, dois para B, um branco e um nulo formam subtotais A=4, B=2, branco=1 e nulo=1. Nominal usa código 2 no RDV e 1 no BU. A igualdade semântica é estabelecida pelo contexto e pela categoria, não pelo inteiro do enum.

**Fontes:** auxiliar CE e amostras completas em Fontes; [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [BU](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1).

## 21 · Regras técnicas de leitura e significado dos estados

As regras abaixo preservam o significado dos contratos ao relacionar representações.

| Regra | Implicação técnica |
|---|---|
| Identificadores têm domínio | Pleito, eleição, cargo, candidato e seção não são inteiros intercambiáveis |
| As fases têm contexto | `o` e `s` no nome/JSON e os enums ASN.1 têm representações próprias |
| Agregação altera a unidade do resultado | Cadastros de seções e conjuntos de BUs não têm a mesma cardinalidade |
| Enum pertence ao contrato | Tipo nominal, legenda, branco e nulo têm códigos diferentes em BU e RDV |
| Campo opcional conserva semântica | Ausência de digitação ou identificação pode ser prevista pelo formato |
| Origem de apuração acompanha o resultado | `origemVotosSA`, `TipoArquivo` e histórico definem proveniência |
| Situação da seção e do hash são distintas | `st` na raiz e `hashes[].st` não devem ser substituídos |
| Estado publicado tem geração | Recebimento, totalização e geração descrevem momentos diferentes |
| Snapshot contém um estado agregado | Somar gerações sucessivas duplica o mesmo resultado representado |
| Assinaturas referem-se a conteúdo e chave | VSC, tuplas do BU e JWS possuem mensagens, algoritmos e contextos próprios |

### Destinação e condição de eleito

O BU e o RDV descrevem o registro e a apuração na seção. O resultado unificado também publica destinação, situação e atribuição de eleitos conforme seu contrato. Esses campos representam regras de totalização e publicação que não se resumem ao tipo do voto digitado.

### O que a documentação ensina sobre a implementação

Os contratos descrevem dados, nomes, campos, algoritmos e estados observáveis. O percurso oficial informa as responsabilidades das etapas. Quando uma validação, transação ou política interna não está detalhada na fonte, esta documentação se limita ao comportamento publicado. Não atribui um mecanismo de backend específico ao TSE.

### Representações assinadas da divulgação

O JWS de divulgação leva um cabeçalho, payload e assinatura em três segmentos. O manual de 2026 usa EdDSA/Ed25519 e diferencia chaves por ambiente. A confiança vem da referência pública do ambiente, não de uma chave fornecida pelo próprio conteúdo a validar. É uma assinatura da publicação, com papel distinto do VSC da urna e da assinatura de tuplas do BU.

**Fontes:** [BU ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV ASN.1](../official-knowledgebase/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1), [EA18](../official-knowledgebase/tse-ea18-arquivo-auxiliar-de-secao.pdf), [manual oficial de JWS](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/manual-verificacao-jws).

## 22 · Glossário técnico e mapa das referências

| Termo | Papel no processo |
|---|---|
| BU / BUSA | Boletim de Urna regular / produzido pelo Sistema de Apuração |
| RDV | Registro Digital do Voto por eleição e cargo |
| MR | Mídia de resultado |
| FC / FV | Flash de carga / flash de votação |
| VOTA / RED / SA | Votação / recuperação de dados / apuração |
| Correspondência | Vínculo entre seção, equipamento e contexto de carga |
| Aptos / comparecimento | Universo habilitado no contexto / quantitativo que compareceu, nos níveis definidos pelo contrato |
| Agregada / principal | Seção incorporada / seção que engloba os resultados das agregadas |
| Votável | Identificação interpretada no contexto de cargo e categoria |
| ASN.1 / BER | Linguagem de descrição de tipos / codificação dos valores em bytes |
| CHOICE / SEQUENCE / ENUMERATED | Alternativa entre tipos / estrutura de campos / domínio de valores |
| VSC | Catálogo de assinaturas e hashes dos produtos relacionados |
| JEZ | Pacote de log do ecossistema, descrito como ZIP pelo manual |
| EA16 / EA18 | Cadastro de seções / auxiliar de seção e conjuntos recebidos |
| EA20 / EA14 / EA15 | Resultado unificado / acompanhamento BR / acompanhamento UF |
| EA10 | Resultado de eleitos nas condições do contrato |
| JWS | Representação digital assinada de conteúdo JSON |
| Snapshot | Retrato de um resultado em determinada geração |
| Abrangência | Nível territorial ao qual a publicação se refere |
| SHA / Base64 / hexadecimal | Algoritmo de resumo / representações textuais de bytes |

### Como escolher a referência

Para o formato binário, leia a especificação ASN.1 e o manual de saída. Para publicação JSON, consulte o contrato EA correspondente e o índice oficial de 2026. Para os arquivos disponíveis no pacote baixado, use `arquivos-tse-info.md`. Para entender o processo, acompanhe os capítulos e as publicações institucionais referenciadas.

A biblioteca distingue **contrato TSE em cópia local**, **referência oficial online**, **amostra de produto** e **material explicativo/inventário local**. Essa identificação indica a proveniência da explicação e o papel de cada item. Uma data de acesso à página ou um hash do snapshot identifica a referência consultada; não constitui uma validação dos resultados eleitorais.

Os textos locais selecionados estão incorporados integralmente ao leitor. As referências novas consultadas no portal são apresentadas por links e notas de escopo; o conteúdo original online é aberto no endereço do TSE. As explicações e exemplos interativos continuam disponíveis offline.

**Fontes:** [índice oficial de contratos 2026](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados), [inventário dos arquivos](../arquivos-tse-info.md), manuais e especificações completos em Fontes.
