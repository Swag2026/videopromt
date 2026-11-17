import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

const MAP = window.__MAP;
const W=1920,H=1080;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const eo=x=>1-Math.pow(1-clamp(x),3);
const eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
function step(tau,w=14,z=.72){if(tau<=0)return 0;const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+(z*w/wd)*Math.sin(wd*tau))}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(7);

const CNT={riyadh:9,makkah:7,eastern:6,madinah:3,qassim:2,asir:2,tabuk:1,hail:1,north:0,jazan:1,najran:1,baha:0,jouf:1};
const LATE=['jazan','qassim','madinah'];

// ---------- renderer ----------
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.setSize(W,H);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
document.getElementById('gl').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x010807);scene.fog=new THREE.FogExp2(0x010807,.016);
const camera=new THREE.PerspectiveCamera(38,W/H,.1,200);
const composer=new EffectComposer(renderer);composer.setSize(W,H);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(W/2,H/2),.5,.5,.78);composer.addPass(bloom);composer.addPass(new OutputPass());

// lights
scene.add(new THREE.AmbientLight(0x6fb8aa,.28));
const key=new THREE.DirectionalLight(0xbfffe9,1.5);key.position.set(-12,24,14);scene.add(key);
const rim=new THREE.DirectionalLight(0x4cc2bf,1.4);rim.position.set(16,8,-18);scene.add(rim);
const hub=new THREE.PointLight(0x00ffaa,0,30,1.6);scene.add(hub);

// ---------- map geometry ----------
function parse(d){const subs=[];let cur=null;const toks=d.match(/[MLZ]|-?[\d.]+/g);let i=0,op='';while(i<toks.length){const t=toks[i];if(t==='M'||t==='L'||t==='Z'){op=t;i++;if(op==='Z'){cur=null}continue}
const x=+toks[i],y=+toks[i+1];i+=2;if(op==='M'){cur=[];subs.push(cur)}cur.push([x,y])}return subs}
const REG={};let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
Object.keys(MAP).forEach(k=>{REG[k]={subs:parse(MAP[k])};REG[k].subs.forEach(s=>s.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1])}))});
const S=22/Math.max(maxx-minx,maxy-miny),CX=(minx+maxx)/2,CY=(miny+maxy)/2;
const wx=x=>(x-CX)*S, wz=y=>(y-CY)*S;   // world x,z
const mapGroup=new THREE.Group();scene.add(mapGroup);
const regionMesh={};
Object.keys(REG).forEach(k=>{const r=REG[k];const n=CNT[k];r.h=.35+n*.28;
 // biggest sub-polygon holds the extrusion; all subs extruded
 const g=new THREE.Group();r.group=g;let sx=0,sz=0,cn=0;
 r.subs.forEach(sub=>{if(sub.length<3)return;const sh=new THREE.Shape(sub.map(p=>new THREE.Vector2(wx(p[0]),-wz(p[1]))));
  const geo=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});
  const col=new THREE.Color().setHSL(.43,.7,.05+n*.01);
  const mat=new THREE.MeshStandardMaterial({color:col,metalness:.35,roughness:.42,emissive:new THREE.Color().setHSL(.44,.9,.02+n*.008),emissiveIntensity:.8});
  const m=new THREE.Mesh(geo,mat);g.add(m);r.mat=mat;
  const eg=new THREE.EdgesGeometry(geo,20);const lm=new THREE.LineBasicMaterial({color:new THREE.Color().setHSL(.46,.9,.55),transparent:true,opacity:.0,blending:THREE.AdditiveBlending});
  const ls=new THREE.LineSegments(eg,lm);g.add(ls);(r.lines=r.lines||[]).push(lm);
  sub.forEach(p=>{sx+=wx(p[0]);sz+=wz(p[1]);cn++})});
 r.cx=sx/cn;r.cz=sz/cn;
 g.rotation.x=-Math.PI/2;g.scale.z=.001;mapGroup.add(g);regionMesh[k]=g});
// region centers: use bbox center for stability
Object.keys(REG).forEach(k=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;REG[k].subs.forEach(s=>s.forEach(p=>{a=Math.min(a,wx(p[0]));b=Math.max(b,wx(p[0]));c=Math.min(c,wz(p[1]));d=Math.max(d,wz(p[1]))}));REG[k].cx=(a+b)/2;REG[k].cz=(c+d)/2});

// ground glow disc
const gc=document.createElement('canvas');gc.width=gc.height=512;{const x=gc.getContext('2d');const g=x.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(0,170,120,.16)');g.addColorStop(.35,'rgba(0,110,80,.06)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,512,512)}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;scene.add(ground);
// grid rings
const rings=new THREE.Group();[8,13,18,24].forEach(r=>{const m=new THREE.Mesh(new THREE.RingGeometry(r,r+.035,160),new THREE.MeshBasicMaterial({color:0x1fd0a0,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=-.01;rings.add(m)});scene.add(rings);

// ---------- particles ----------
const NP=9000;const pg=new THREE.BufferGeometry();const ppos=new Float32Array(NP*3),pcol=new Float32Array(NP*3);pg.setAttribute('position',new THREE.BufferAttribute(ppos,3));pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));
const ptex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const pmat=new THREE.PointsMaterial({size:.09,map:ptex,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
const points=new THREE.Points(pg,pmat);points.frustumCulled=false;scene.add(points);
// sample targets from rasterized regions
const keys=Object.keys(REG);const P=[];
(function(){const SZ=900;const cv=document.createElement('canvas');cv.width=cv.height=SZ;const x=cv.getContext('2d',{willReadFrequently:true});
 const bs=SZ/Math.max(maxx-minx,maxy-miny)*.98;
 keys.forEach(k=>{x.clearRect(0,0,SZ,SZ);x.fillStyle='#fff';REG[k].subs.forEach(sub=>{x.beginPath();sub.forEach((p,i)=>{const X=SZ/2+(p[0]-CX)*bs,Y=SZ/2+(p[1]-CY)*bs;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.closePath();x.fill()});
  const d=x.getImageData(0,0,SZ,SZ).data;const px=[];for(let i=3;i<d.length;i+=4*3){if(d[i]>128){const j=(i-3)/4;px.push([j%SZ,Math.floor(j/SZ)])}}
  REG[k].px=px});
 const tot=keys.reduce((a,k)=>a+REG[k].px.length,0);
 keys.forEach(k=>{const r=REG[k];r.np=Math.max(30,Math.round(NP*r.px.length/tot))});
 let id=0;keys.forEach(k=>{const r=REG[k];for(let i=0;i<r.np&&id<NP;i++,id++){const p=r.px[Math.floor(R()*r.px.length)];
  const tx=(p[0]-SZ/2)/bs*S,tz=(p[1]-SZ/2)/bs*S;
  const a=R()*Math.PI*2,rr=18+R()*26,hh=(R()-.5)*26;
  P.push({k,tx,tz,ox:Math.cos(a)*rr,oy:hh+6,oz:Math.sin(a)*rr,sp:.25+R()*.6,ph:R()*6.28,dl:R()*.9,jy:R()*.12})}});
 while(P.length<NP){const q=P[P.length-1];P.push({...q})}
})();
const c1=new THREE.Color(0x4cc2bf),c2=new THREE.Color(0x7dffcf),c3=new THREE.Color(0xffffff);

// ---------- arcs ----------
const HUB='riyadh';const arcs=[];const arcGroup=new THREE.Group();scene.add(arcGroup);
const sparkGeo=new THREE.BufferGeometry();const NS_=3;const sparkN=(keys.length-1)*NS_;const spos=new Float32Array(sparkN*3),scol=new Float32Array(sparkN*3);sparkGeo.setAttribute('position',new THREE.BufferAttribute(spos,3));sparkGeo.setAttribute('color',new THREE.BufferAttribute(scol,3));
const sparks=new THREE.Points(sparkGeo,new THREE.PointsMaterial({size:.5,map:ptex,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sparks.frustumCulled=false;scene.add(sparks);
keys.filter(k=>k!==HUB).forEach((k,i)=>{const a=new THREE.Vector3(REG[k].cx,REG[k].h+.1,REG[k].cz),b=new THREE.Vector3(REG[HUB].cx,REG[HUB].h+.1,REG[HUB].cz);const mid=a.clone().lerp(b,.5);mid.y+=3.2+a.distanceTo(b)*.28;
 const curve=new THREE.QuadraticBezierCurve3(a,mid,b);const pts=curve.getPoints(60);const geo=new THREE.BufferGeometry().setFromPoints(pts);
 const late=LATE.includes(k);const mat=new THREE.LineBasicMaterial({color:late?0xff5a5f:0x2fffc0,transparent:true,opacity:0,blending:THREE.AdditiveBlending});const line=new THREE.Line(geo,mat);arcGroup.add(line);
 arcs.push({k,curve,mat,line,late,idx:i,pl:pts.length})});

// ---------- 3D contract cards ----------
const FONT='Plex, "Segoe UI", Arial, sans-serif';
function cardTex(title,total,pct,status,col){const c=document.createElement('canvas');c.width=1024;c.height=576;const x=c.getContext('2d');
 const r=(a,b,w,h,rad)=>{x.beginPath();x.roundRect(a,b,w,h,rad)};
 const g=x.createLinearGradient(0,0,0,576);g.addColorStop(0,'rgba(255,255,255,.97)');g.addColorStop(1,'rgba(236,246,242,.97)');x.fillStyle=g;r(0,0,1024,576,56);x.fill();
 x.fillStyle='#0B0F0E';x.font=`700 54px ${FONT}`;x.fillText(title,56,110);
 x.fillStyle='#6B7672';x.font=`500 34px ${FONT}`;x.fillText('Total '+total,56,168);
 x.fillStyle=col+'22';r(700,64,268,64,32);x.fill();x.fillStyle=col;x.font=`700 32px ${FONT}`;x.textAlign='center';x.fillText(status,834,108);x.textAlign='left';
 x.fillStyle='#E4EAE7';r(56,250,912,26,13);x.fill();x.fillStyle='#009969';r(56,250,912*pct/100,26,13);x.fill();
 x.fillStyle='#6B7672';x.font=`500 32px ${FONT}`;x.fillText(pct+'% paid',56,336);
 ['Q1','Q2','Q3','Q4'].forEach((q,i)=>{x.fillStyle=i<Math.round(pct/25)?'#D9F5E9':'#F0F3F2';r(56+i*232,400,208,84,42);x.fill();x.fillStyle=i<Math.round(pct/25)?'#007A55':'#8A9692';x.font=`700 34px ${FONT}`;x.textAlign='center';x.fillText(q,56+i*232+104,455);x.textAlign='left'});
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.colorSpace=THREE.SRGBColorSpace;return t}
const CARDS=[['Warehouse · Riyadh','SAR 517,500',100,'Paid','#007A55'],['Warehouse · Jeddah','SAR 2,300,000',25,'Active','#0A5FA8'],['Branch · Makkah','SAR 91,000',60,'Active','#0A5FA8']];
let cards=[];
function buildCards(){cards=CARDS.map((c,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(5.12,2.88),new THREE.MeshBasicMaterial({map:cardTex(...c),transparent:true,side:THREE.DoubleSide,toneMapped:false,color:new THREE.Color(.42,.42,.42)}));m.visible=false;scene.add(m);return m})}

// white logo for overlay
(function(){const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);document.getElementById('flogo').src=c.toDataURL()};im.src=window.__LOGO})();
// ---------- camera path ----------
// [t, pos(x,y,z), look(x,y,z), fov]
const RP=REG[HUB];
const CAMK=[
 [0,   [0,5,34],[0,5.5,0],38],
 [3.6, [-3,9,27],[0,2.2,0],38],
 [6.0, [-17,8,14],[0,1,-1],36],
 [8.5, [-5,10,19],[0,1,0],36],
 [11,  [8,17,16],[0,1,-1],40],
 [13.5,[RP.cx+9,12,RP.cz+15],[RP.cx,1.2,RP.cz],36],
 [15.2,[RP.cx+2.5,3.8,RP.cz+8.5],[RP.cx-.2,2.6,RP.cz],34],
 [19,  [RP.cx-3,4.6,RP.cz+9],[RP.cx+.8,2.6,RP.cz],34],
 [21.5,[RP.cx-8,12,RP.cz+16],[0,1,0],38],
 [24,  [0,30,6],[0,0,0],38],
 [27,  [0,27,8],[0,0,-1],40],
 [30,  [0,20,24],[0,2,0],40]];
function camAt(t){let i=0;while(i<CAMK.length-2&&t>CAMK[i+1][0])i++;const a=CAMK[i],b=CAMK[i+1];const u=eio((t-a[0])/(b[0]-a[0]));
 const L=(p,q)=>[lerp(p[0],q[0],u),lerp(p[1],q[1],u),lerp(p[2],q[2],u)];return {p:L(a[1],b[1]),l:L(a[2],b[2]),f:lerp(a[3],b[3],u)}}

// ---------- overlay refs ----------
const $=id=>document.getElementById(id);
function mrise(el,t,a,w=18){el.style.transform=`translateY(${(1-step(t-a,w,.9))*118}%)`}
const fmt=n=>Math.round(n).toLocaleString('en-US');
let ready=false;
document.fonts.load('700 40px Plex').then(()=>document.fonts.load('500 40px Plex')).then(()=>{buildCards();ready=true;window.__ready=true});

const tmp=new THREE.Vector3();
function render(t){
 if(!ready)return;
 // camera (+ handheld sway)
 const c=camAt(t);camera.position.set(c.p[0]+Math.sin(t*.7)*.18,c.p[1]+Math.cos(t*.6)*.12,c.p[2]);camera.lookAt(c.l[0],c.l[1],c.l[2]);camera.fov=c.f;camera.updateProjectionMatrix();
 // map rise: staggered per region, starts 3.2
 let ri=0;const order=keys.slice().sort((a,b)=>CNT[a]-CNT[b]);
 order.forEach((k,i)=>{const r=REG[k];const a=3.3+i*.16;const s=step(t-a,10,.78);r.s=s;r.group.scale.z=Math.max(.001,r.h*s);
  const glow=clamp((t-a)*1.5);r.lines.forEach(l=>l.opacity=.0+.9*glow);
  let em=1;if(LATE.includes(k)&&t>9&&t<19.5)em=1+Math.abs(Math.sin(t*3.2+i))*2.5;r.mat.emissiveIntensity=em;
  if(LATE.includes(k)&&t>9&&t<19.5){r.mat.emissive.setRGB(.55+.4*Math.abs(Math.sin(t*3.2+i)),.05,.06)}else{r.mat.emissive.setHSL(.44,.9,.02+CNT[k]*.008)}});
 // dim for finale
 const dim=eio((t-27.4)/1.2);mapGroup.visible=true;scene.background.setRGB(.0015,.011,.010);
 rim.intensity=1.0*(1-dim*.7);key.intensity=1.5*(1-dim*.75);
 // particles
 const arr=pg.attributes.position.array,col=pg.attributes.color.array;
 for(let i=0;i<NP;i++){const q=P[i];const u=eio((t-1.0-q.dl)/2.2);const swirl=t*q.sp;
  const cx=Math.cos(q.ph+swirl)*Math.hypot(q.ox,q.oz)*(1-.25*u),cz=Math.sin(q.ph+swirl)*Math.hypot(q.ox,q.oz)*(1-.25*u);
  const cy=q.oy+Math.sin(t*.8+q.ph)*1.2;
  const r=REG[q.k];const topY=Math.max(.05,r.h*(r.s||0))+.06+q.jy*.4;
  const fade=1;let x=lerp(cx,q.tx,u),y=lerp(cy,topY,u),z=lerp(cz,q.tz,u);
  if(u>=1){y=topY+Math.sin(t*1.6+q.ph)*.05*(t>13?1:.3);}
  arr[i*3]=x;arr[i*3+1]=y;arr[i*3+2]=z;
  const m=u>.98?1:0;const cc=(i%7==0)?c3:(i%3==0)?c2:c1;const b=(.30+.30*Math.sin(t*2+q.ph))*(0.35+.65*(1-dim*.8));
  col[i*3]=cc.r*b;col[i*3+1]=cc.g*b;col[i*3+2]=cc.b*b}
 pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
 pmat.size=.09+.02*Math.sin(t*2);
 // hub light
 hub.position.set(RP.cx,RP.h+1.8,RP.cz);hub.intensity=clamp((t-4)/2)*(8+3*Math.sin(t*3))*(1-dim*.7);
 // arcs
 const aon=clamp((t-8.3)/1.4);
 arcs.forEach((a,i)=>{const ap=eo((t-8.4-i*.12)/.9);a.mat.opacity=ap*(a.late?(.55+.45*Math.abs(Math.sin(t*3))):.75)*(1-dim*.7);a.line.geometry.setDrawRange(0,Math.floor(a.pl*ap));
  for(let j=0;j<NS_;j++){const idx=i*NS_+j;const u=((t*.28+j/NS_+i*.13)%1);const p=a.curve.getPoint(a.late?1-u:u);const on=ap>.98?1:0;
   spos[idx*3]=p.x;spos[idx*3+1]=p.y;spos[idx*3+2]=p.z;const cc=a.late?[1,.35,.38]:[.4,1,.8];const f=on*Math.sin(u*Math.PI)*(1-dim*.7);scol[idx*3]=cc[0]*f;scol[idx*3+1]=cc[1]*f;scol[idx*3+2]=cc[2]*f}});
 sparkGeo.attributes.position.needsUpdate=true;sparkGeo.attributes.color.needsUpdate=true;
 // cards (scene D 13.8-19.6)
 cards.forEach((m,i)=>{const a=14.2+i*.35;const s=step(t-a,12,.7);const out=1-step(t-19.9,14,.9)*1;
  const vis=t>a&&t<21.2;m.visible=vis;
  const base=new THREE.Vector3(RP.cx-.6+i*1.1,3.1+i*.16,RP.cz-.8-i*2.6);
  const sel=(i==1&&t>16.6)?step(t-16.6,12,.7):0;
  m.position.set(base.x+(i-1)*2.1*(1-.0)+sel*0,base.y+(1-s)*2.4-sel*0,base.z+sel*1.2);
  m.position.x=base.x+(i-1)*0.0+i*.9-0.9+sel*.0;
  m.rotation.y=-.35+(1-s)*.8+Math.sin(t*.6+i)*.03;m.rotation.x=-.12;
  const sc=(.001+s*(.5+.25*sel))*Math.max(0,out);m.scale.setScalar(Math.max(.001,sc));
  m.material.opacity=clamp(s*2)*(1-clamp((t-20.4)/.8))});
 rings.rotation.y=t*.05;
 bloom.strength=.5+.12*Math.sin(t*.5);
 composer.render();

 // ---------- overlay ----------
 const ids=['k1','t1'];
 // captions
 const cap=(a,b,k,tt,kk)=>{const on=t>=a&&t<b;$('capk').firstChild.textContent=on?kk:$('capk').firstChild.textContent};
 const S_=[[3.7,8.6,'01 · THE NETWORK','13 regions.<br>One picture'],[8.6,13.6,'02 · PAYMENTS','Every installment,<br>tracked'],[13.6,19.4,'03 · CONTRACTS','Every lease,<br>one touch'],[19.4,24.2,'04 · APPROVALS','Five stages,<br>zero chasing'],[24.2,27.6,'05 · REPORTS & ACCESS','One platform.<br>Two languages']];
 let cur=-1;S_.forEach((s,i)=>{if(t>=s[0]&&t<s[1])cur=i});
 if(cur>=0){const s=S_[cur];if($('capt').dataset.i!=cur){$('capt').dataset.i=cur;$('capt').firstChild.innerHTML=s[3];$('capk').firstChild.textContent=s[2]}
  const a=S_[cur][0],b=S_[cur][1];mrise($('capk').firstChild,t,a+.12);mrise($('capt').firstChild,t,a+.25);
  const out=clamp((t-(b-.35))/.35);$('cap').style.opacity=1-out;$('cap').style.transform=`translateY(${-out*24}px)`}else{$('cap').style.opacity=0}
 // stats chips (B)
 const sb=$('stats');const stOn=t>5.2&&t<8.6;sb.style.opacity=stOn?clamp(Math.min((t-5.2)*4,(8.6-t)*4)):0;
 $('s_reg').textContent=Math.round(13*eo((t-5.2)/1));$('s_co').textContent=Math.round(3*eo((t-5.3)/.8));$('s_con').textContent=fmt(128*eo((t-5.4)/1.4));
 // payments glass chips (C)
 const pb=$('pay');const pOn=t>9.6&&t<13.4;pb.style.opacity=pOn?clamp(Math.min((t-9.6)*4,(13.4-t)*4)):0;pb.style.transform=`translateY(${(1-step(t-9.6,14,.8))*40}px)`;
 $('p_pct').textContent=Math.round(72*eo((t-9.8)/1.2))+'%';$('p_od').textContent=Math.round(7*eo((t-9.9)/1))+'';
 $('p_ring').setAttribute('stroke-dashoffset',1-.72*eo((t-9.8)/1.4));
 // approvals (E)
 const ab=$('appr');const aOn=t>19.8&&t<24.4;ab.style.opacity=aOn?clamp(Math.min((t-19.8)*4,(24.4-t)*4)):0;ab.style.transform=`translateY(${(1-step(t-19.8,14,.8))*60}px)`;
 const nt=[20.4,21.1,21.8,22.5,23.2];[...document.querySelectorAll('.an')].forEach((n,i)=>{const on=t>=nt[i];n.style.background=on?(i==4?'#009969':'#fff'):'rgba(255,255,255,.14)';n.style.color=on?(i==4?'#fff':'#0B0F0E'):'rgba(255,255,255,.5)';n.style.transform=`scale(${on?1+.18*Math.max(0,1-(t-nt[i])*4):1})`});
 [...document.querySelectorAll('.al')].forEach((l,i)=>l.firstChild.style.width=eo((t-nt[i])/.55)*100+'%');
 const st=$('stamp');const ss=step(t-23.3,22,.55);st.style.opacity=t<23.3||t>24.3?0:1;st.style.transform=`rotate(-6deg) scale(${1.7-.7*ss})`;
 // language (F)
 const fb=$('lang');const fOn=t>24.6&&t<27.8;fb.style.opacity=fOn?clamp(Math.min((t-24.6)*4,(27.8-t)*4)):0;fb.style.transform=`translateY(${(1-step(t-24.6,14,.8))*60}px)`;
 const ar=t>26.0;$('l_title').textContent=ar?'عقود الإيجارات':'Rental Contracts';$('l_sub').textContent=ar?'منصة واحدة لكل عقودك':'One platform for every lease';$('lang').style.direction=ar?'rtl':'ltr';
 $('l_btn').style.transform=`scale(${1+.18*Math.max(0,1-Math.abs(t-26.0)*5)})`;
 // finale text
 const lp2=step(t-28.3,13,.62);$('flogo').style.opacity=t>28.2?clamp(lp2*2):0;$('flogo').style.transform=`scale(${Math.max(.001,lp2)}) rotate(${(1-lp2)*-70}deg)`;$('dimmer').style.opacity=dim;
 const ft=$('fin');ft.style.opacity=t>28?1:0;mrise($('f1'),t,28.6);mrise($('f2'),t,28.75);
 $('fch').style.opacity=clamp((t-29.1)*6);$('fch').style.transform=`translateY(${(1-step(t-29.1,16,.8))*30}px)`;
 // intro text
 const it=$('intro');it.style.opacity=t<3.7?1:0;
 mrise($('i1'),t,.3);mrise($('i2'),t,.55);mrise($('i3'),t,.8);
 const sw=eio((t-2.6)/1);it.style.transform=`scale(${1-sw*.1}) translateY(${-sw*30}px)`;it.style.opacity=t<3.7?clamp(1-(t-2.9)/.7):0;
 // vignette / letterbox flash at start
 $('fade').style.opacity=clamp(1-t/.5);
}
window.render=render;
if(!window.__NOAUTO){const t0=performance.now();(function f(){render(((performance.now()-t0)/1000)%30);requestAnimationFrame(f)})()}
