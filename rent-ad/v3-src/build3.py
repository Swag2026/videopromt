import base64,json,subprocess
sp='/tmp/claude-0/-home-user-crmswag/7279c051-7396-5438-b9cd-f1a8690dac61/scratchpad/'
subprocess.run(['npx','esbuild','main.js','--bundle','--format=iife','--minify','--outfile=bundle.js','--log-level=error'],check=True)
h=open('shell.html',encoding='utf8').read()
labels=['Request','Accounting','HR','Finance','Approved']
st=''.join(f'<div class="abs" style="left:{i*290+20}px;top:0;width:150px;text-align:center"><div class="an">{"✓" if i==4 else i+1}</div><div style="font-size:24px;font-weight:700;margin-top:12px">{l}</div></div>' for i,l in enumerate(labels))
st+=''.join(f'<div class="abs al" style="left:{i*290+20+113}px;top:33px;width:204px;height:9px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden"><i style="display:block;height:100%;width:0;background:#7DF5C5"></i></div>' for i in range(4))
h=h.replace('STEPPER',st)
b='data:image/png;base64,'+base64.b64encode(open(sp+'logo0.png','rb').read()).decode()
h=h.replace('LOGO0',b).replace('MAPJSON',open(sp+'map.json').read()).replace('FONT500',open(sp+'font500.txt').read()).replace('FONT700',open(sp+'font700.txt').read())
h=h.replace('BUNDLE',open('bundle.js',encoding='utf8').read().replace('</script>','<\\/script>'))
open('v3.html','w',encoding='utf8').write(h)
print(len(h))
