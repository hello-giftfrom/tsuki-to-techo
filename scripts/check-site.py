"""Validate the generated static site without installing test dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

root=Path('dist')
class Page(HTMLParser):
    def __init__(self,path):
        super().__init__(); self.attrs=[]; self.ids=set(); self.json=[]; self.capture=False; self.buffer=''
        self.feed(path.read_text())
    def handle_starttag(self,tag,attrs):
        a=dict(attrs); self.attrs.append((tag,a))
        if 'id' in a:
            assert a['id'] not in self.ids, ('duplicate id',a['id'])
            self.ids.add(a['id'])
        if tag=='script' and a.get('type')=='application/ld+json': self.capture=True;self.buffer=''
    def handle_data(self,data):
        if self.capture:self.buffer+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.capture:self.json.append(json.loads(self.buffer));self.capture=False

pages={('/'+str(p.relative_to(root)).removesuffix('index.html')):Page(p) for p in root.rglob('index.html')}
assert len(pages)==46, len(pages)
articles=0
for route,p in pages.items():
    canonical=[a['href'] for tag,a in p.attrs if tag=='link' and a.get('rel')=='canonical']
    assert len(canonical)==1 and urlsplit(canonical[0]).path==route,route
    assert sum(tag=='title' for tag,a in p.attrs)==1,route
    for name in ['description']:
        assert any(tag=='meta' and a.get('name')==name and a.get('content') for tag,a in p.attrs),route
    for name in ['og:title','og:description','og:url','og:image']:
        assert any(tag=='meta' and a.get('property')==name and a.get('content') for tag,a in p.attrs),route
    graph=p.json[0]['@graph'];types=[x['@type'] for x in graph]
    assert 'WebSite' in types and 'Organization' in types,route
    if 'BlogPosting' in types:
        articles+=1;assert 'BreadcrumbList' in types
        post=next(x for x in graph if x['@type']=='BlogPosting')
        assert post['url']==canonical[0] and post['datePublished'] and post['author']['name']=='月と手帳'
    for tag,a in p.attrs:
        link=a.get('href') if tag=='a' else a.get('src') if tag in ['img','script'] else None
        if not link or not (link.startswith('/') or link.startswith('#')):continue
        u=urlsplit(link);target=u.path or route
        if target in pages:
            if u.fragment:assert unquote(u.fragment) in pages[target].ids,(route,link)
        else:assert (root/target.lstrip('/')).is_file(),(route,link)
assert articles==6
ns={'m':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap=ET.parse(root/'sitemap.xml')
assert {urlsplit(e.text).path for e in sitemap.findall('.//m:loc',ns)}==set(pages)
oracle=pages['/oracle/']
assert sum('data-draw' in a for tag,a in oracle.attrs)==5
assert sum('data-reading' in a for tag,a in oracle.attrs)==36
assert all('hidden' in a for tag,a in oracle.attrs if 'data-reading' in a)
for row in (root/'_redirects').read_text().splitlines():
    if not row.strip() or row.startswith('#'):continue
    old,new,status=row.split();assert new in pages and old+'/' not in pages and status=='301'
print('PASS: 46 pages, 6 articles, metadata/JSON-LD, sitemap, local links/assets/anchors, redirects, 5 cards / 36 hidden results')
