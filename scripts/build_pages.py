#!/usr/bin/env python3
"""Empacota how-it-works e documentos auxiliares sem os dados brutos de votos.

Usa somente arquivos do repositório e a biblioteca padrão do Python. O snapshot
sources.js já contém os textos e as poucas amostras documentais do guia.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import tempfile

PROJECT = Path(__file__).resolve().parents[1]
GUIDE = PROJECT
GENERATOR = 'how-it-works-pages-v1'
ASSETS = (
    'index.html', 'app.js', 'content.js', 'dark.css', 'style.css',
    'README.md', 'guia-pleito.md', 'official-references.json',
    'vendor/marked.umd.js', 'vendor/marked.LICENSE.md',
)
DOC_EXTENSIONS = {'.pdf', '.md', '.asn1', '.puml', '.py', '.txt', '.html'}
RAW_EXTENSIONS = {'.csv', '.tsv', '.zip', '.7z', '.dat', '.rdv', '.bu',
                  '.vsc', '.jez', '.sqlite', '.sqlite3', '.db', '.wal', '.shm'}


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def read_snapshot():
    text = (GUIDE / 'sources.js').read_text(encoding='utf-8')
    prefix = 'globalThis.PLEITO_SOURCES = '
    if text.count(prefix) != 1 or not text.rstrip().endswith(';'):
        raise ValueError('sources.js não contém o snapshot esperado.')
    return json.loads(text.split(prefix, 1)[1].strip()[:-1])


def script(value):
    text = json.dumps(value, ensure_ascii=False, indent=2)
    for before, after in [('<', '\\u003c'), ('>', '\\u003e'), ('&', '\\u0026'),
                          ('\u2028', '\\u2028'), ('\u2029', '\\u2029')]:
        text = text.replace(before, after)
    return '// Snapshot para publicação.\nglobalThis.PLEITO_SOURCES = ' + text + ';\n'


def safe_file(base, relative):
    parts = PurePosixPath(relative)
    if parts.is_absolute() or '..' in parts.parts:
        raise ValueError(f'Caminho fora do escopo: {relative}')
    candidate = base / str(parts)
    if not candidate.resolve().is_relative_to(base.resolve()):
        raise ValueError(f'Caminho fora do escopo: {relative}')
    # Não publicar links simbólicos, nem seguir diretórios simbólicos.
    current = candidate
    while current != base:
        if current.is_symlink():
            raise ValueError(f'Link simbólico não permitido: {relative}')
        current = current.parent
    if not candidate.is_file():
        raise FileNotFoundError(f'Documento necessário ausente: {candidate}')
    return candidate


def is_document(path):
    return (path.suffix.lower() in DOC_EXTENSIONS
            and not any(part.startswith('.') or part == '__pycache__' for part in path.parts))


def build(output):
    output = Path(output).resolve()
    # Esta função só cria um diretório novo; não apaga arquivos de trabalho.
    if output.exists():
        raise FileExistsError(f'A saída já existe: {output}. Use um diretório de saída novo.')
    if GUIDE.is_relative_to(output):
        raise ValueError('A saída não pode conter os arquivos de origem.')
    snapshot = read_snapshot()
    guide_path = snapshot.get('guidePath')
    if not guide_path or snapshot.get('projectLayout') != 'standalone':
        raise ValueError('Atualize o snapshot com build_sources.py para o repositório independente.')
    source_prefix = guide_path.split('/docs/', 1)[0] + '/'
    mapping = {}
    excluded = []
    output.parent.mkdir(parents=True, exist_ok=True)
    # Preparar em pasta temporária: qualquer erro deixa a saída solicitada intacta.
    with tempfile.TemporaryDirectory(prefix='.pages-', dir=output.parent) as temporary:
        staging = Path(temporary) / 'site'
        staging.mkdir()

        def copy(source, target):
            destination = staging / target
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, destination)

        for relative in ASSETS:
            copy(safe_file(GUIDE, relative), relative)
            mapping[source_prefix + 'docs/how-it-works/' + relative] = relative

        # Só os documentos auxiliares destes diretórios entram como anexos.
        # SQLite e os formatos de dados brutos não estão nesta lista permitida.
        for directory in ('references/docs/official-knowledgebase', 'references/docs/info'):
            for source in sorted((PROJECT / directory).rglob('*')):
                if not source.is_file() or not is_document(source.relative_to(PROJECT)):
                    continue
                relative = source.relative_to(PROJECT).as_posix()
                source = safe_file(PROJECT, relative)
                target = 'attachments/' + relative
                copy(source, target)
                mapping[source_prefix + relative.removeprefix('references/')] = target
        for source in sorted((PROJECT / 'references/docs').glob('*.md')):
            source = safe_file(PROJECT, source.relative_to(PROJECT).as_posix())
            relative = source.relative_to(PROJECT).as_posix()
            target = 'attachments/' + relative
            copy(source, target)
            mapping[source_prefix + relative.removeprefix('references/')] = target

        # São cópias de quatro PDFs, incluídas no repositório para que o CI
        # não dependa da pasta data/ que só existe na máquina de origem.
        for original, relative in sorted(snapshot.get('supportingDocuments', {}).items()):
            if not relative.startswith('supporting-docs/') or Path(relative).suffix.lower() != '.pdf':
                raise ValueError(f'Anexo externo não permitido: {relative}')
            source = safe_file(GUIDE, relative)
            target = 'attachments/' + relative
            copy(source, target)
            mapping[original] = target

        for original, relative in sorted(snapshot['localDocuments'].items()):
            source = safe_file(PROJECT, relative)
            if source.suffix.lower() not in DOC_EXTENSIONS:
                raise ValueError(f'Documento local não permitido: {relative}')
            target = relative if relative in ASSETS else 'attachments/' + relative
            copy(source, target)
            mapping[original] = target

        for doc in snapshot['documents']:
            if sha256(doc['text'].encode('utf-8')) != doc['textSha256']:
                raise ValueError(f'Texto incorporado inconsistente: {doc["path"]}')
            path = doc['path']
            if path in mapping:
                if sha256((staging / mapping[path]).read_bytes()) != doc['sha256']:
                    raise ValueError(f'Snapshot desatualizado para {path}; regenere sources.js.')
            elif not path.startswith('@'):
                if Path(path).suffix.lower() in DOC_EXTENSIONS:
                    raise FileNotFoundError(f'Documentação do snapshot sem anexo: {path}')
                excluded.append(path)
            if doc.get('originalPath') and doc['originalPath'] not in mapping:
                excluded.append(doc['originalPath'])

        snapshot['publication'] = {
            'generator': GENERATOR, 'mode': 'pages', 'files': mapping,
            'excludedSources': sorted(set(excluded)),
        }
        (staging / 'sources.js').write_text(script(snapshot), encoding='utf-8')
        (staging / '.nojekyll').touch()
        files = []
        for path in sorted(staging.rglob('*')):
            if not path.is_file():
                continue
            lower = path.name.lower()
            if path.suffix.lower() in RAW_EXTENSIONS or any(x in lower for x in ('.sqlite', '.db-')):
                raise ValueError(f'Dado bruto encontrado no pacote: {path}')
            raw = path.read_bytes()
            files.append({'path': path.relative_to(staging).as_posix(), 'bytes': len(raw), 'sha256': sha256(raw)})
        manifest = {'generator': GENERATOR, 'entrypoint': 'index.html',
                    'files': files, 'totalBytes': sum(f['bytes'] for f in files),
                    'documentLinks': mapping, 'excludedSources': sorted(set(excluded))}
        (staging / 'publication-manifest.json').write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        shutil.move(str(staging), str(output))
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=PROJECT / '_site')
    args = parser.parse_args()
    try:
        result = build(args.output)
    except (ValueError, OSError) as error:
        parser.exit(1, f'Erro de empacotamento: {error}\n')
    print(f'{len(result["files"])} arquivos; {result["totalBytes"] / 1024 / 1024:.2f} MiB; saída: {args.output}')
    print('Pacote inclui documentação auxiliar e exclui CSV, DAT, VSC, JEZ, ZIP e bancos de votos.')


if __name__ == '__main__':
    main()
