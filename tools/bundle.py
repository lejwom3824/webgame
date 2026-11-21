#!/usr/bin/env python3
"""재의 미드가르드 — 나뉜 파일(index.html + css/ + js/)을 파일 하나로 합침.
사용: python3 tools/bundle.py [출력 경로]   (기본: dist/midgard.html)
- <link rel="stylesheet" href="css/…"> 는 <style>내용</style> 로 바뀜
- 붙어 있는 <script src="js/…"></script> 묶음은 <script> 하나로 합쳐짐
  (묶음의 두 번째 파일부터는 맨 앞 "use strict"; 줄을 떼고 이어 붙임)
"""
import re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRICT='"use strict";\n'
def rd(p):return open(os.path.join(ROOT,p),encoding='utf-8').read()
def build():
  s=rd('index.html')
  s=re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',lambda m:'<style>'+rd(m.group(1))+'</style>',s)
  def js(m):
    files=re.findall(r'<script src="(js/[^"]+)"></script>',m.group(0));out=''
    for i,f in enumerate(files):
      c=rd(f)
      if i>0:
        assert c.startswith(STRICT),f+' 맨 앞에 "use strict"; 줄이 없음'
        c=c[len(STRICT):]
      out+=c
    return '<script>'+out+'</script>'
  return re.sub(r'(?:<script src="js/[^"]+"></script>)+',js,s)
if __name__=='__main__':
  out=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'dist','midgard.html')
  os.makedirs(os.path.dirname(out) or '.',exist_ok=True)
  open(out,'w',encoding='utf-8').write(build());print('만듦:',out)
