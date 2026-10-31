#!/usr/bin/env python3
"""Atualiza as referências e amostras do guia técnico de arquivos do TSE."""
from pathlib import Path
import csv
import hashlib
import json
import re
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]
ROOT = PROJECT.parent
KB = PROJECT / 'docs/official-knowledgebase'
PUBLIC = ROOT / 'data/TSE_ORIGINAIS_20261027T004126Z_CONSULTA_PUBLICA'


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def serialize(value):
    text = json.dumps(value, ensure_ascii=False, indent=2)
    for before, after in [('<', '\\u003c'), ('>', '\\u003e'), ('&', '\\u0026'), ('\u2028', '\\u2028'), ('\u2029', '\\u2029')]:
        text = text.replace(before, after)
    return '// Snapshot local. Atualizar com build_sources.py.\nglobalThis.PLEITO_SOURCES = ' + text + ';\n'


def main():
    inventory = PROJECT / 'docs/arquivos-tse-info.md'
    guide = HERE / 'guia-pleito.md'
    paths = [inventory, guide]
    paths += [p for p in KB.rglob('*') if p.is_file() and p.suffix.lower() in {'.pdf', '.asn1', '.puml'}]
    paths += list((ROOT / 'data/MG/Relatorio_Resultado_Totalizacao_2026_MG').glob('*.pdf'))
    paths += [PUBLIC / '2026/dados-abertos/votacao_secao_2026_MG/leiame.pdf',
              PUBLIC / '2026/configuracoes/3221/ac-p003221-cs.json',
              PUBLIC / '2026/apuracao/snapshot-5595-6c11492ff8d1aa2a.json',
              PUBLIC / '2026/2turno/ce-13897-0095-0364/auxiliares/3f256bb5fe9829b5.json']
    docs = []
    supporting_documents = {}
    for path in sorted(set(paths)):
        if not path.is_file():
            raise FileNotFoundError(f'Fonte ausente: {path}')
        raw = path.read_bytes()
        rel = path.relative_to(ROOT).as_posix()
        ext = path.suffix.lower()
        # CI recebe somente este repositório. Preserve aqui os PDFs de apoio
        # referenciados fora dele; nunca copie CSV, BU, RDV, logs ou bancos.
        if ext == '.pdf' and not path.is_relative_to(PROJECT):
            supporting = HERE / 'supporting-docs' / rel
            supporting.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, supporting)
            supporting_documents[rel] = supporting.relative_to(HERE).as_posix()
        pages = None
        if ext == '.pdf':
            result = subprocess.run(['pdftotext', '-layout', str(path), '-'], capture_output=True, check=True)
            pageparts = result.stdout.decode('utf-8').split('\f')
            if pageparts and not pageparts[-1].strip():
                pageparts.pop()
            pages = len(pageparts)
            body = '\n\n'.join(f'──── Página {i + 1} ────\n{page}' for i, page in enumerate(pageparts))
            kind = 'PDF · texto extraído'
        else:
            body = raw.decode('utf-8')
            kind = {'.md': 'Markdown', '.asn1': 'ASN.1', '.puml': 'PlantUML', '.json': 'JSON · amostra completa'}[ext]
        title = path.name
        if ext == '.md':
            match = re.search(r'^# (.+)$', body, re.M)
            if match:
                title = match[1]
        if path == inventory:
            group, nature = 'Inventário dos produtos disponíveis', 'Inventário local · não é contrato TSE'
        elif path == guide:
            group, nature = 'Guia técnico explicativo', 'Explicação editorial baseada nos contratos'
        elif ext == '.json':
            group, nature = 'Amostras de produtos TSE', 'Produto baixado · amostra completa'
        elif 'exemplos-de-boletins' in rel:
            group, nature = 'Exemplos oficiais simulados', 'Exemplo de documentação · fase simulada'
        elif '/data/' in str(path) and 'Relatorio_' in str(path):
            group, nature = 'Relatórios e leiautes TSE', 'Produto oficial em cópia local'
        else:
            group, nature = 'Formatos e manuais TSE', 'Contrato ou manual TSE em cópia local'
        docs.append({'id': 'src-' + digest(rel.encode())[:12], 'path': rel, 'title': title,
                     'kind': kind, 'sha256': digest(raw), 'textSha256': digest(body.encode()), 'bytes': len(raw),
                     'text': body, 'pages': pages, 'group': group, 'nature': nature})
    csvpath = PUBLIC / '2026/dados-abertos/votacao_secao_2026_MG/votacao_secao_2026_MG.csv'
    with csvpath.open(encoding='latin1', newline='') as handle:
        columns = next(csv.reader(handle, delimiter=';'))
    header = {'path': csvpath.relative_to(ROOT).as_posix(), 'encoding': 'Latin-1', 'delimiter': ';', 'columns': columns}
    body = json.dumps(header, ensure_ascii=False, indent=2)
    docs.append({'id': 'cabecalho-csv-tse-mg', 'path': '@estrutura/cabecalho-csv-tse-mg',
                 'title': f'CSV TSE de MG · cabeçalho real das {len(columns)} colunas', 'kind': 'Estrutura extraída', 'sha256': None,
                 'textSha256': digest(body.encode()), 'text': body, 'bytes': len(body.encode()),
                 'group': 'Amostras de produtos TSE', 'nature': 'Extração de estrutura · conteúdo tabular não incorporado',
                 'originalPath': header['path']})
    refs = json.loads((HERE / 'official-references.json').read_text())
    for ref in refs:
        body = f"# {ref['title']}\n\nReferência oficial online, consultada em {ref['checkedAt']}.\n\n{ref['description']}\n\n[Consultar o documento oficial]({ref['url']})\n\nEsta entrada é uma nota de referência editorial, não uma reprodução integral do documento online.\n"
        docs.append({'id': 'official-' + ref['id'], 'path': '@oficial/' + ref['id'], 'title': ref['title'],
                     'kind': 'Referência oficial online', 'sha256': None, 'textSha256': digest(body.encode()),
                     'text': body, 'bytes': len(body.encode()), 'group': ref['group'], 'externalUrl': ref['url'],
                     'nature': 'Link oficial · nota de referência editorial', 'description': ref['description']})
    parts = re.split(r'^## (\d{2}) · (.+)$', guide.read_text(), flags=re.M)
    chapters = [{'id': parts[i], 'title': parts[i + 1], 'text': parts[i + 2].strip()} for i in range(1, len(parts), 3)]
    sample_paths = [d['path'] for d in docs if d['kind'].startswith('JSON')]
    value = {'schemaVersion': 2, 'referenceDate': '2026-10-30', 'inventoryDate': '2026-10-30',
             'guidePath': guide.relative_to(ROOT).as_posix(),
             'supportingDocuments': supporting_documents,
             'inventoryPath': inventory.relative_to(ROOT).as_posix(), 'documents': docs, 'chapters': chapters,
             'csvHeader': header, 'publicRoot': PUBLIC.relative_to(ROOT).as_posix(),
             'samplePaths': sample_paths, 'officialReferences': refs}
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=HERE, delete=False, prefix='.sources-', suffix='.tmp') as handle:
        handle.write(serialize(value))
        temp = Path(handle.name)
    temp.chmod(0o644)
    temp.replace(HERE / 'sources.js')
    print(f'{len(chapters)} capítulos; {len(docs)} referências ({len(refs)} online); snapshot atualizado.')


if __name__ == '__main__':
    main()
