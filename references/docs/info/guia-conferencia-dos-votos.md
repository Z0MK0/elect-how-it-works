# Guia de arquivos para conferência dos votos

Este documento explica quais arquivos deste diretório são usados para conferir os votos, o resultado de cada seção e a integridade dos arquivos. Foi elaborado em 27/10/2026 com base nos manuais, especificações e scripts presentes no acervo local.

**Para consultar o resultado de uma seção, use o Boletim de Urna (BU). Para recontar os registros dos votos, use o Registro Digital do Voto (RDV). Para conferir a integridade e as assinaturas desses arquivos, use o arquivo `.vsc` correspondente.**

Este guia documenta o procedimento. Sua criação não significa que a recontagem ou a validação criptográfica do acervo tenha sido executada.

## 1. Quais arquivos usar

O conjunto de arquivos por seção de Minas Gerais está em:

```text
/home/ed/andre/repos/vote/data/MG/bu_imgbu_logjez_rdv_vscmr_2026_1t_MG/
```

| Arquivo | Conteúdo e uso na conferência |
|---|---|
| `*-rdv.dat` | Registro Digital do Voto. Contém registros de votos por eleição e cargo, com o tipo do voto e, quando aplicável, a digitação. Permite recontar e comparar com os totais do BU. |
| `*-bu.dat` | Boletim de Urna. Contém os totais apurados por candidato, partido e categoria de voto, além da identificação da seção, da urna e de informações de comparecimento. |
| `*-imgbu.dat` | Conteúdo de impressão do BU, acondicionado em um envelope. Permite conferir a representação do boletim impresso. A extensão `.dat` não indica que seja um PDF ou uma imagem comum. |
| `*-vota.vsc` | Arquivo de hashes e assinaturas dos arquivos de resultado. Permite verificar se os arquivos correspondem aos resumos assinados e validar assinaturas com as chaves e certificados previstos no formato. |
| `*-log.jez` | Pacote de logs. Permite examinar eventos como abertura, habilitação, encerramento e procedimentos de contingência. Os logs complementam a investigação operacional; não fornecem a escolha de candidato de cada eleitor. |
| `*-busa.dat` | BU gerado pelo Sistema de Apuração (SA). Deve ser interpretado conforme a origem e o tipo da apuração, inclusive situações com cédulas ou recuperação de resultados. |
| `*-imgbusa.dat`, `*-sa.vsc`, `*-logsa.jez` | Conteúdo de impressão, assinaturas e logs relacionados ao Sistema de Apuração. |

O manual também descreve arquivos produzidos pelo Recuperador de Dados (RED), como `*-rdvred.dat` e `*-red.vsc`. A existência de um tipo na documentação não garante que ele esteja presente em todo conjunto local.

O RDV preserva o sigilo: os registros publicados não revelam a ordem de votação dos eleitores. Não se deve associar a posição de um registro no RDV a uma pessoa, a uma linha do log ou a escolhas em outros cargos.

## 2. Como identificar arquivos da mesma seção

A documentação define o padrão:

```text
fpppppuuMMMMMZZZZSSSS-suf.ext
```

| Componente | Significado |
|---|---|
| `f` | Fase: `o` para oficial e `s` para simulado, conforme a nomenclatura documentada. |
| `ppppp` | Código do pleito com cinco posições. |
| `uu` | Unidade da Federação. |
| `MMMMM` | Código do município no cadastro eleitoral. |
| `ZZZZ` | Número da zona eleitoral. |
| `SSSS` | Número da seção eleitoral. |
| `suf.ext` | Tipo do arquivo, como `bu.dat`, `rdv.dat` ou `vota.vsc`. |

Exemplo existente no acervo:

```text
o03220mg5397002750100-bu.dat
o03220mg5397002750100-rdv.dat
o03220mg5397002750100-imgbu.dat
o03220mg5397002750100-vota.vsc
o03220mg5397002750100-log.jez
```

Esse prefixo identifica fase oficial, pleito `03220`, UF `mg`, município `53970`, zona `0275` e seção `0100`. A representação impressa do BU identifica o município como Ubá e o primeiro turno de 04/10/2026.

O nome ajuda a reunir os arquivos, mas a conferência também deve verificar a identificação interna, a fase, o pleito, a eleição, o código de carga e a correspondência da urna. O prefixo `o` sozinho não comprova autenticidade nem confirma que aquela versão foi a aceita na totalização.

Uma seção pode agregar outras seções. Em contingências, também pode haver histórico envolvendo mais de uma urna física. Preserve essas informações ao comparar os resultados.

## 3. Procedimento de conferência

### 3.1. Definir o conjunto correto

1. Escolha eleição, turno, UF, município, zona e seção.
2. Reúna BU, RDV, assinaturas, conteúdo de impressão e logs correspondentes, conforme a disponibilidade.
3. Confira os identificadores internos e eventuais seções agregadas ou procedimentos do SA/RED.
4. Preserve os originais. Grave decodificações, contagens e relatórios em outra pasta.
5. Registre a origem, a data de obtenção e os hashes dos arquivos usados, para permitir a reprodução da análise.

### 3.2. Conferir hashes, assinaturas e certificado

O `.vsc` lista arquivos assinados, seus hashes e suas assinaturas. A conferência deve verificar os bytes dos arquivos, e não apenas seus nomes ou os valores de um CSV.

O script local `assinatura_hash.py` calcula SHA-512 dos arquivos listados, compara os resumos dos conjuntos SW e HW e valida as assinaturas de hardware e a assinatura do certificado com as chaves raiz incorporadas ao leitor. Ele não equivale a uma validação completa de todos os requisitos de uma infraestrutura de certificados, como revogação e validade temporal.

Arquivos listados no `.vsc` precisam estar disponíveis na pasta esperada pelo script. Uma mensagem de arquivo ausente indica que a verificação daquele item não foi concluída; não demonstra, por si só, alteração dos votos. Não substitua arquivos ausentes por arquivos de outra seção.

O script `bu_assinatura_tuplas.py` verifica a cadeia de hashes dos blocos de votação do BU e a assinatura do hash final. Use-o em conjunto com a validação dos arquivos e do certificado.

### 3.3. Recontar o RDV e comparar com o BU

Para cada eleição e cargo:

1. Leia os registros do RDV.
2. Classifique-os segundo o tipo de voto e a digitação, quando existente.
3. Conte os votos nominais por candidato, os de legenda por partido e as demais categorias.
4. Compare cada subtotal com a categoria correspondente no BU.
5. Compare os totais do cargo e documente separadamente os registros ou categorias que não puderam ser conciliados.

Exemplo ilustrativo: se o RDV apresentar 120 votos nominais para determinado candidato no cargo de presidente, o BU da mesma eleição e seção deve informar 120 nessa categoria e candidato. Repita a comparação para os demais candidatos, brancos e nulos.

Cuidados necessários na implementação:

- **Os números dos tipos de voto diferem entre RDV e BU.** Por exemplo, `nominal` é `2` no RDV e `1` no BU; `legenda` é `1` no RDV e `4` no BU. Faça o mapeamento semântico usando as especificações ASN.1.
- O RDV prevê categorias como votos após suspensão, nulos por repetição e cargo sem candidato. Trate-as conforme as regras da eleição e sua representação no BU, sem descartá-las ou agrupá-las silenciosamente.
- A ausência de `digitacao` em certos tipos de voto é prevista no formato.
- Preserve a digitação e o contexto do cargo ao classificar votos nominais, de legenda e nulos. Não considere todo número digitado como voto nominal válido.
- Considere `quantidadeEscolhas` e as regras do cargo. Não suponha que a quantidade de registros de qualquer cargo seja sempre igual ao comparecimento da seção.
- No RDV gerado pelo SA, confira `origemVotosSA` e o tipo de apuração. Se a origem for um BU, a comparação com esse BU não constitui uma recontagem independente das escolhas originais.

Os scripts `rdv_dump.py` e `rdv_resumo.py` permitem ler os registros, mas **não fazem automaticamente a conciliação completa entre RDV e BU**. A contagem comparativa precisa ser feita em uma etapa adicional.

### 3.4. Comparar com o boletim impresso e seus QR codes

Confira os identificadores, o cargo e os subtotais do BU digital com o conteúdo de impressão correspondente. Quando houver acesso ao boletim físico, registre sua origem e compare seus dados também.

Para QR codes, reúna todas as partes do BU e do certificado exigidas pelo formato e valide a identidade da urna, os hashes e a assinatura. O manual de QR code e os exemplos em `docs` descrevem esse procedimento.

O leitor local `verifica_qrcode.py` procura certificados raiz em uma subpasta `python/certificados`, que não foi encontrada no conjunto de scripts inspecionado. Esse fluxo requer preparar as referências confiáveis previstas pelo leitor antes de considerá-lo operacional.

### 3.5. Comparar com os dados consolidados

Os seguintes CSVs oferecem outras representações dos resultados:

| Arquivo local | Uso |
|---|---|
| `data/votacao_secao_2026_BR/votacao_secao_2026_BR.csv` | Tabela de votação por seção, com campos de eleição, turno, UF, município, zona, seção, cargo, votável e quantidade de votos. O leiaute informa codificação Latin-1 e separador `;`. |
| `data/MG/final--boletins_detalhados_mg.csv/boletins_detalhados_mg.csv` | Tabela de análise com identificação das seções, votos, comparecimento, URLs, hashes e indicadores de conferência. Os nomes e campos observados incluem dados do segundo turno. |
| `data/MG/final--versoes_mg.csv/versoes_mg.csv` | Tabela de acompanhamento de versões de BUs, URLs, hashes, situação e indicação de seleção. |

O acervo bruto usado como exemplo está identificado como **primeiro turno**, enquanto os CSVs de análise de MG inspecionados contêm referências ao pleito `3221` e à votação de 25/10/2026. Não compare esses conjuntos diretamente como se representassem o mesmo turno.

Para cruzar bases, use uma chave que inclua eleição/turno, UF, município, zona, seção, cargo e votável/categoria. Considere versões, agregações e situação da totalização. Verifique se o hash selecionado na tabela corresponde ao BU efetivamente analisado.

Campos como `sha256_confere` ou `cache_votos_confere` são resultados registrados na tabela de análise. Para uma verificação independente, refaça as operações sobre os arquivos originais. O SHA-256 de um inventário não deve ser comparado diretamente ao SHA-512 do `.vsc`: são algoritmos e referências diferentes.

### 3.6. Investigar divergências com os logs

Consulte os eventos dos logs quando houver dúvida sobre horários, encerramento, recuperação de dados, troca de urna ou mídia e outros procedimentos. Use também o histórico de carga e os campos de origem dos resultados.

O exemplo de `*-log.jez` inspecionado é um pacote ZIP. Há diferença entre descrições de compactação nos manuais locais; identifique o formato real do arquivo antes de extraí-lo. Leia o manual de logs para interpretar as mensagens e seus autenticadores.

Registre o ponto exato da divergência: identificação, versão, arquivo ausente, leitura do formato, hash, assinatura, subtotal ou publicação. Uma divergência precisa de investigação da causa e não deve receber uma conclusão automática sobre sua origem.

## 4. Comandos para os leitores existentes

Os exemplos abaixo usam Bash e caminhos absolutos da instalação atual. Não alteram os arquivos originais. A preparação do ambiente instala as dependências declaradas pelos scripts, incluindo uma dependência Git fixada em um commit, e requer acesso à rede.

### Preparar o ambiente e os caminhos

```bash
python3 -m venv /tmp/vote-conferencia-venv
/tmp/vote-conferencia-venv/bin/python -m pip install -r /home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/python/requirements.txt

VOTE_PY=/tmp/vote-conferencia-venv/bin/python
VOTE_FORMATOS=/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital
VOTE_DADOS=/home/ed/andre/repos/vote/data/MG/bu_imgbu_logjez_rdv_vscmr_2026_1t_MG
VOTE_SECAO=o03220mg5397002750100
VOTE_SAIDA=/tmp/vote-conferencia-o03220mg5397002750100
mkdir -p "$VOTE_SAIDA"
```

Execute os blocos seguintes na mesma sessão de shell, para preservar as variáveis.

### Ler BU e RDV

```bash
"$VOTE_PY" "$VOTE_FORMATOS/python/bu_dump.py" \
  -a "$VOTE_FORMATOS/spec/bu.asn1" \
  -b "$VOTE_DADOS/$VOTE_SECAO-bu.dat" \
  > "$VOTE_SAIDA/bu-decodificado.txt" 2> "$VOTE_SAIDA/bu-leitura.log"

"$VOTE_PY" "$VOTE_FORMATOS/python/rdv_resumo.py" \
  -a "$VOTE_FORMATOS/spec/rdv.asn1" \
  -r "$VOTE_DADOS/$VOTE_SECAO-rdv.dat" \
  > "$VOTE_SAIDA/rdv-resumo.txt" 2> "$VOTE_SAIDA/rdv-leitura.log"
```

Para a estrutura completa do RDV, substitua `rdv_resumo.py` por `rdv_dump.py` e use outro nome de saída. O resumo apresenta os registros por cargo; não é uma tabela de totais conciliados com o BU. Os leitores locais usam enums numéricos, exigindo consulta às respectivas especificações.

### Conferir os arquivos e as assinaturas

```bash
"$VOTE_PY" "$VOTE_FORMATOS/python/assinatura_hash.py" \
  -a "$VOTE_FORMATOS/spec/assinatura.asn1" \
  -s "$VOTE_DADOS/$VOTE_SECAO-vota.vsc" \
  > "$VOTE_SAIDA/assinaturas.log" 2>&1
VOTE_STATUS_ASSINATURAS=$?
printf 'Status da validação de arquivos e assinaturas: %s\n' "$VOTE_STATUS_ASSINATURAS"
```

### Conferir a cadeia de hashes e a assinatura dos totais do BU

```bash
"$VOTE_PY" "$VOTE_FORMATOS/python/bu_assinatura_tuplas.py" \
  -a "$VOTE_FORMATOS/spec/bu.asn1" \
  -b "$VOTE_DADOS/$VOTE_SECAO-bu.dat" \
  -t "$VOTE_FORMATOS/spec/assinatura.asn1" \
  -s "$VOTE_DADOS/$VOTE_SECAO-vota.vsc" \
  > "$VOTE_SAIDA/bu-tuplas.log" 2>&1
VOTE_STATUS_TUPLAS=$?
printf 'Status da validação das tuplas: %s\n' "$VOTE_STATUS_TUPLAS"
```

Nos dois validadores, o código de saída `0` indica sucesso das verificações implementadas; um código diferente de zero exige leitura do log. Falhas de dependência, formato ou arquivo ausente também podem causar saída diferente de zero.

Os comandos acima foram conferidos contra os argumentos dos scripts, mas não executados como validação dos votos. Na inspeção inicial, `asn1tools` não estava disponível no Python padrão. A execução efetiva e seus resultados devem ser registrados separadamente.

## 5. Para que serve `script-auxiliares-urna`

Essa pasta contém páginas HTML com listas de caminhos de componentes de software e seus hashes na coluna `SHA512b64 (radix)`. Os arquivos executáveis e bibliotecas mencionados nas tabelas não estão incorporados aos HTMLs.

As listas abrangem sistemas das urnas modelos 2020 e 2022, aplicativos auxiliares, transportadores, componentes de segurança e módulos de totalização.

Para usá-las, obtenha o componente correspondente, calcule SHA-512 sobre seus bytes, codifique o resultado em Base64 e compare com a linha correta de uma referência confiável. Confira também a versão e o conjunto a que o componente pertence.

Essa comparação verifica correspondência do software com a referência. Ela não reconta votos nem substitui a comparação RDV/BU ou a validação dos arquivos de resultado com o `.vsc`. Não compare o hash de um BU com uma linha destinada a um executável ou biblioteca.

## 6. O que registrar no relatório de conferência

- Identificação da eleição, turno, UF, município, zona, seção e eventuais agregações.
- Origem, data de obtenção, nomes, tamanhos e hashes dos arquivos analisados.
- Versão dos leitores e especificações usados.
- Resultado de cada etapa: identificação, hashes, assinaturas/certificado, tuplas do BU, recontagem do RDV, comparação com impressão e comparação com publicação.
- Subtotais por cargo, candidato/partido e categoria, com diferença entre RDV, BU e base consolidada.
- Arquivos ausentes, categorias não conciliadas, erros, procedimentos de contingência e limites da análise.

Separe etapas aprovadas, divergentes, inconclusivas e não executadas. A leitura bem-sucedida de um arquivo ou a igualdade entre dois totais não demonstra que todas as demais verificações foram realizadas.

## 7. Referências locais

- [Leia-me do conjunto BU/RDV de MG](/home/ed/andre/repos/vote/data/MG/bu_imgbu_logjez_rdv_vscmr_2026_1t_MG/leiame.pdf).
- [Processamento dos arquivos de saída da urna eletrônica](/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/README.pdf).
- Especificações: [BU](/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/bu.asn1), [RDV](/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/rdv.asn1) e [assinaturas](/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/spec/assinatura.asn1).
- [Scripts de leitura e validação](/home/ed/andre/repos/vote/docs/formato-arquivos-de-bu-rdv-e-assinatura-digital/python).
- [Manual de QR code no Boletim de Urna](/home/ed/andre/repos/vote/docs/manual-do-qr-code-no-boletim-de-urna.pdf) e [exemplos de boletins](/home/ed/andre/repos/vote/docs/exemplos-de-boletins-de-urna-com-qr-code).
- [Manual de logs do ecossistema](/home/ed/andre/repos/vote/docs/log-do-ecossistema.pdf).
- [Leiaute do CSV de votação por seção](/home/ed/andre/repos/vote/data/votacao_secao_2026_BR/leiame.pdf).
- Exemplos de listas de hashes de software: [Urna 2020](/home/ed/andre/repos/vote/script-auxiliares-urna/path1u20/path1u20.html), [Urna 2022](/home/ed/andre/repos/vote/script-auxiliares-urna/path1u22/path1u22.html) e [Votação](/home/ed/andre/repos/vote/script-auxiliares-urna/pc1vota/pc1vota.html).
