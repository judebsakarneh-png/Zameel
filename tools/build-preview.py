"""Makes a click-through preview of the built site for a claude.ai Artifact.

The real site uses root-relative links (/assets/..., /services/x/). An Artifact serves files
next to one page, so this copies the site into OUT, rewrites every link to a relative path
(/services/x/ -> ../services/x/index.html), blanks the contact form endpoint, and turns the
homepage into a fragment (the Artifact wraps it in its own document).

Usage:  node tools/build.js && python3 tools/build-preview.py <out-dir> <root-page.html>
Prints the {published path: source} map to pass as the Artifact's files.
"""
import json, os, re, shutil, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT, ROOT_PAGE = sys.argv[1], sys.argv[2]
SKIP_DIRS = {"tools", "src", "api", ".git"}
KEEP_EXT = {".html", ".css", ".js", ".svg", ".png", ".ico"}

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
files = []
for d, dirs, names in os.walk(SRC):
    dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
    for n in names:
        rel = os.path.relpath(os.path.join(d, n), SRC)
        if os.path.splitext(n)[1] in KEEP_EXT and not rel.startswith("."):
            files.append(rel)

def rel_link(target, depth):
    pre = "../" * depth
    path, _, frag = target.partition("#")
    path = path.split("?")[0].lstrip("/")
    if path == "" or path.endswith("/"):
        path += "index.html"
    return pre + path + ("#" + frag if frag else "")

def rewrite(html, depth):
    html = re.sub(r'(href|src|data-mark)="(/(?!/)[^"]*)"', lambda m: '%s="%s"' % (m.group(1), rel_link(m.group(2), depth)), html)
    html = html.replace('data-endpoint="/api/contact"', 'data-endpoint=""')
    html = re.sub(r'<link rel="manifest"[^>]*>\n?', "", html)
    return html

mapping = {}
for rel in files:
    src = os.path.join(SRC, rel)
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if rel.endswith(".html"):
        depth = rel.count("/")
        html = rewrite(open(src, encoding="utf-8").read(), depth)
        if rel == "index.html":
            html = re.sub(r"<!doctype html>\s*<html[^>]*>\s*<head>\s*", "", html, flags=re.I)
            html = re.sub(r"<title>.*?</title>", "<title>Zameel Website v2</title>", html)
            html = re.sub(r"</head>\s*<body[^>]*>", "", html)
            html = re.sub(r"</body>\s*</html>\s*$", "", html)
            open(ROOT_PAGE, "w", encoding="utf-8").write(html)
            continue
        open(dst, "w", encoding="utf-8").write(html)
    else:
        shutil.copy(src, dst)
    mapping[rel] = dst
print(json.dumps(mapping, indent=1))
