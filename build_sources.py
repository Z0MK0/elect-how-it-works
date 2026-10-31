#!/usr/bin/env python3
"""Atualiza o snapshot do guia a partir dos documentos deste repositório.

As pequenas amostras documentais de dados são preservadas do snapshot existente.
Não depende do diretório vote/, de bancos ou de arquivos brutos de votação.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
PREFIX = 'globalThis.PLEITO_SOURCES = '


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def serialize(value):
    text = json.dumps(value, ensure_ascii=False, indent=2)
    for before, after in [('<', '\\u003c'), ('>', '\\u003e'), ('&', '\\u0026'),
                          ('\u2028', '\\u2028'), ('\u2029', '\\u2029')]:
        text = text.replace(before, after)
    return '// Snapshot local. Atualizar com build_sources.py.\n' + PREFIX + text + ';\n'


def read_pdf(path):
    result = subprocess.run(['pdftotext', '-layout', str(path), '-'], capture_output=True, check=True)
    pages = result.stdout.decode('utf-8').split('\f')
    if pages and not pages[-1].strip():
        pages.pop()
    text = '\n\n'.join(f'──── Página {i + 1} ────\n{page}' for i, page in enumerate(pages))
    return text, len(pages)


def main():
    source = ROOT / 'sources.js'
    snapshot = json.loads(source.read_text(encoding='utf-8').split(PREFIX, 1)[1].strip()[:-1])
    files = snapshot['localDocuments']
    for doc in snapshot['documents']:
        relative = files.get(doc['path'])
        if not relative:
            continue
        path = ROOT / relative
        if not path.resolve().is_relative_to(ROOT) or path.is_symlink():
            raise ValueError(f'Fonte fora do repositório: {relative}')
        raw = path.read_bytes()
        current_hash = digest(raw)
        if path.suffix.lower() == '.pdf':
            # A extração já incorporada continua válida se o PDF não mudou.
            if current_hash != doc['sha256']:
                doc['text'], doc['pages'] = read_pdf(path)
        else:
            doc['text'] = raw.decode('utf-8')
        doc.update(sha256=current_hash, bytes=len(raw), textSha256=digest(doc['text'].encode('utf-8')))
    refs = json.loads((ROOT / 'official-references.json').read_text(encoding='utf-8'))
    by_id = {d['id']: d for d in snapshot['documents']}
    for ref in refs:
        doc = by_id['official-' + ref['id']]
        doc.update(title=ref['title'], description=ref['description'], externalUrl=ref['url'], group=ref['group'])
        doc['text'] = (f"# {ref['title']}\n\nReferência oficial online, consultada em {ref['checkedAt']}.\n\n"
                       f"{ref['description']}\n\n[Consultar o documento oficial]({ref['url']})\n\n"
                       "Esta entrada é uma nota de referência editorial, não uma reprodução integral do documento online.\n")
        doc['textSha256'] = digest(doc['text'].encode('utf-8'))
        doc['bytes'] = len(doc['text'].encode('utf-8'))
    parts = re.split(r'^## (\d{2}) · (.+)$', (ROOT / 'guia-pleito.md').read_text(encoding='utf-8'), flags=re.M)
    snapshot['chapters'] = [{'id': parts[i], 'title': parts[i + 1], 'text': parts[i + 2].strip()}
                            for i in range(1, len(parts), 3)]
    snapshot['officialReferences'] = refs
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=ROOT, delete=False,
                                     prefix='.sources-', suffix='.tmp') as handle:
        handle.write(serialize(snapshot))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(source)
    print(f'{len(snapshot["chapters"])} capítulos; {len(snapshot["documents"])} referências. Snapshot atualizado com fontes locais.')


if __name__ == '__main__':
    main()
