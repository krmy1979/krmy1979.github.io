/* ---------- WORLD OF WORDS (twilight) ---------- */
const skyDusk=skyTex([[0,'#1a1247'],[.34,'#4b2a8a'],[.48,'#c05ad0'],[.53,'#ffb0d0'],[.58,'#6a3aa8'],[1,'#1a1247']]);
const words=new T.Group();words.visible=false;scene.add(words);
const WD={done:0,carry:-1,cool:0,miss:0,scr:16,items:[],npcs:[],tiles:[],giftOn:false,fin:false};
window.__WD=WD;
const WDC={x:0,z:-2,r:23};
let wdGift;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function reTag(o,key,text,sx,sy){if(o[key]){scene.remove(o[key]);try{o[key].material.map.dispose();o[key].material.dispose();}catch(e){}}const s=nameTag(text);s.scale.set(sx,sy,1);s.visible=false;scene.add(s);o[key]=s;return s;}
const WORDS=[
 ['APPLE','תפוח',g=>{mesh(new T.SphereGeometry(.5,14,10),std(0xff4b4b,{roughness:.35}),0,0,0,g);mesh(new T.CylinderGeometry(.04,.04,.3,5),std(0x8a5a3a),0,.55,0,g);const l=mesh(new T.SphereGeometry(.16,8,6),std(0x3ddc84),.16,.62,0,g);l.scale.set(1.5,.4,.8);}],
 ['KEY','מפתח',g=>{mesh(new T.TorusGeometry(.26,.09,8,18),std(0xFFC93C,{metalness:.8,roughness:.25}),0,.42,0,g);mesh(new T.BoxGeometry(.12,.8,.1),std(0xFFC93C,{metalness:.8,roughness:.25}),0,-.2,0,g);mesh(new T.BoxGeometry(.3,.1,.1),std(0xFFC93C,{metalness:.8,roughness:.25}),.15,-.5,0,g);mesh(new T.BoxGeometry(.22,.1,.1),std(0xFFC93C,{metalness:.8,roughness:.25}),.11,-.3,0,g);}],
 ['BOOK','ספר',g=>{mesh(new T.BoxGeometry(.95,.24,.7),std(0x3D7BFF,{roughness:.5}),0,0,0,g);mesh(new T.BoxGeometry(.86,.18,.72),std(0xffffff),.03,0,0,g);mesh(new T.BoxGeometry(.5,.02,.12),std(0xFFC93C),0,.13,0,g,false);}],
 ['STAR','כוכב',g=>{mesh(new T.OctahedronGeometry(.58,0),std(0xFFC93C,{emissive:0xFFC93C,emissiveIntensity:.7,flatShading:true}),0,0,0,g);g.add(glow(0xFFC93C,2.6,.5));}],
 ['BOAT','סירה',g=>{mesh(new T.BoxGeometry(1.1,.3,.46),std(0x8a5a3a),0,-.3,0,g);mesh(new T.CylinderGeometry(.04,.04,.9,5),std(0x5a3f2e),0,.2,0,g);const s=mesh(new T.ConeGeometry(.42,.8,3),std(0xffffff,{flatShading:true}),.2,.25,0,g);s.rotation.y=Math.PI/2;}],
 ['HAT','כובע',g=>{mesh(new T.CylinderGeometry(.36,.4,.5,14),std(0x7B4DFF,{roughness:.6}),0,.1,0,g);mesh(new T.CylinderGeometry(.68,.68,.07,18),std(0x7B4DFF,{roughness:.6}),0,-.16,0,g);mesh(new T.CylinderGeometry(.41,.41,.1,14),std(0xFF4D8D),0,-.08,0,g,false);}],
 ['TREE','עץ',g=>{mesh(new T.CylinderGeometry(.1,.14,.5,6),std(0x8a5a3a),0,-.4,0,g);mesh(new T.ConeGeometry(.5,.9,7),std(0x2fbf71,{flatShading:true}),0,.25,0,g);}],
 ['FISH','דג',g=>{const b=mesh(new T.SphereGeometry(.42,12,10),std(0xFF8A3D,{roughness:.4}),0,0,0,g);b.scale.set(1.5,.8,.5);const tl=mesh(new T.ConeGeometry(.3,.45,4),std(0xFF8A3D),-.75,0,0,g);tl.rotation.z=-Math.PI/2;mesh(new T.SphereGeometry(.06,6,6),std(0x0E1024),.38,.1,.2,g,false);}],
 ['HOUSE','בית',g=>{mesh(new T.BoxGeometry(.85,.6,.85),std(0xfff3df),0,-.2,0,g);const r=mesh(new T.ConeGeometry(.75,.5,4),std(0xff4b4b,{flatShading:true}),0,.35,0,g);r.rotation.y=Math.PI/4;mesh(new T.BoxGeometry(.2,.34,.04),std(0x8a5a3a),0,-.33,.44,g,false);}],
 ['CUP','כוס',g=>{mesh(new T.CylinderGeometry(.36,.28,.62,14),std(0x19E3C2,{roughness:.3}),0,0,0,g);const h=mesh(new T.TorusGeometry(.2,.06,6,12),std(0x19E3C2,{roughness:.3}),.42,0,0,g);}],
 ['MOON','ירח',g=>{mesh(new T.SphereGeometry(.5,14,10),std(0xfff3d6,{emissive:0xfff3d6,emissiveIntensity:.6}),0,0,0,g);mesh(new T.SphereGeometry(.12,8,6),std(0xd9cfae),.2,.15,.42,g,false);mesh(new T.SphereGeometry(.08,8,6),std(0xd9cfae),-.15,-.1,.46,g,false);}],
 ['DRUM','תוף',g=>{mesh(new T.CylinderGeometry(.5,.5,.5,16),std(0xff4b4b,{roughness:.5}),0,0,0,g);mesh(new T.CylinderGeometry(.52,.52,.06,16),std(0xfff3df),0,.27,0,g);mesh(new T.CylinderGeometry(.52,.52,.06,16),std(0xfff3df),0,-.27,0,g);}]
];
(function buildWords(){
  const tc=[0xFF4D8D,0x19E3C2,0xFFC93C,0x3D7BFF,0xB48CFF,0xFF8A3D];
  mesh(new T.CylinderGeometry(26,24.5,1.6,30),std(0x4a3a8a,{roughness:.8}),0,-.8,-2,words);
  mesh(new T.ConeGeometry(24.5,30,30),std(0x2b1f4f,{flatShading:true}),0,-16.6,-2,words).rotation.x=Math.PI;
  mesh(new T.CylinderGeometry(10,10,.06,40),std(0x6a54c0,{roughness:.6,emissive:0x6a54c0,emissiveIntensity:.15}),0,.03,-2,words,false);
  [12.5,18].forEach(r=>{mesh(new T.RingGeometry(r,r+.35,56),new T.MeshBasicMaterial({color:0xffb0d0,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false}),0,.04,-2,words,false).rotation.x=-Math.PI/2;});
  // giant open books around the edge
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,g=new T.Group();g.position.set(Math.cos(a)*22,0,-2+Math.sin(a)*22);
    [-1,1].forEach(s=>{const pg=mesh(new T.BoxGeometry(3.4,5,.3),std(0xfff9ee,{roughness:.9}),s*1.75,2.9,0,g);pg.rotation.y=s*-.35;const cv=mesh(new T.BoxGeometry(3.6,5.3,.14),std(tc[i%6],{roughness:.6}),s*1.78,2.9,-.26,g);cv.rotation.y=s*-.35;
      for(let k=0;k<5;k++){const ln=mesh(new T.BoxGeometry(2.4,.12,.04),std(0x6a54c0),s*1.7,4.4-k*.7,.2,g,false);ln.rotation.y=s*-.35;}});
    g.lookAt(0,0,-2);words.add(g);const lg=glow(tc[i%6],9,.35);lg.position.set(g.position.x*.92,5,-2+(g.position.z+2)*.92);words.add(lg);}
  // drifting letters
  'ABCDEFGHJKLMNPRSTWXYZ'.split('').forEach((ch,i)=>{const tex=canvasTex(96,96,(g2,w,h)=>{g2.clearRect(0,0,w,h);g2.font='bold 78px Rubik, Arial, sans-serif';g2.textAlign='center';g2.textBaseline='middle';g2.fillStyle=['#ffb0d0','#9ffff0','#ffe9a8','#cdbbff'][i%4];g2.fillText(ch,w/2,h/2+4);});
    const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.85}));s.scale.set(1.6,1.6,1);words.add(s);
    const a=rnd()*6.28,r=8+rnd()*26,by=5+rnd()*14,sp=.05+rnd()*.12,ph=rnd()*6;spin.push({w:'words',f:(t)=>{s.position.set(Math.cos(a+t*sp)*r,by+Math.sin(t*.7+ph)*1.2,-2+Math.sin(a+t*sp)*r);}});});
  [[-70,-8,-90,18],[75,10,-120,22],[-40,24,-170,15]].forEach(a=>{mesh(new T.CylinderGeometry(a[3],a[3]*.92,1.4,10),std(0x4a3a8a,{flatShading:true}),a[0],a[1]-.7,a[2],words);mesh(new T.ConeGeometry(a[3]*.93,a[3]*1.3,10),std(0x2b1f4f,{flatShading:true}),a[0],a[1]-1.4-a[3]*.65,a[2],words).rotation.x=Math.PI;for(let k=0;k<5;k++)mesh(new T.BoxGeometry(a[3]*.6,1.6,a[3]*.45),std(tc[k%6]),a[0],a[1]+.8+k*1.6,a[2],words).rotation.y=k*.4;});
  const mg=glow(0xffd6f0,200,.8);mg.position.set(-140,150,-380);mg.material.fog=false;words.add(mg);
  // the six people
  const skins=[0xF6D3B3,0xE2A66F,0xC68642,0x8D5A3B,0x5C3A21,0xE2A66F];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.52,x=Math.cos(a)*15,z=-2+Math.sin(a)*15,g=new T.Group();g.position.set(x,0,z);
    mesh(new T.CylinderGeometry(.55,.68,1.7,12),std(tc[i],{roughness:.6}),0,1.45,0,g);mesh(new T.SphereGeometry(.6,16,12),std(skins[i],{roughness:.6}),0,2.8,0,g);
    mesh(new T.SphereGeometry(.64,16,10,0,Math.PI*2,0,Math.PI*.5),std(tc[(i+3)%6],{roughness:.5}),0,2.86,0,g);[-.2,.2].forEach(q=>mesh(new T.SphereGeometry(.075,8,6),std(0x0E1024),q,2.85,.55,g,false));
    [-.26,.26].forEach(q=>mesh(new T.CylinderGeometry(.2,.18,.7,8),std(0x2A3142),q,.35,0,g));g.lookAt(0,0,-2);words.add(g);
    WD.npcs.push({g:g,x:x,z:z,ix:x*.86,iz:-2+(z+2)*.86,item:0,ok:false,bub:null});}
  // item models (shown beside whoever lost that word)
  WORDS.forEach(w=>{const g=new T.Group();w[2](g);g.scale.set(1.5,1.5,1.5);g.visible=false;words.add(g);WD.items.push({g:g});});
  // word tiles
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,x=Math.cos(a)*6.5,z=-2+Math.sin(a)*6.5;const m=mesh(new T.BoxGeometry(1.9,.3,1.9),std(tc[i],{roughness:.4,emissive:tc[i],emissiveIntensity:.3}),x,.35,z,words);WD.tiles.push({m:m,hx:x,hz:z,item:0,done:false,scr:0,tag:null,tag2:null});}
  mesh(new T.CylinderGeometry(1.3,1.7,1.2,10),std(0xf4f4f8,{flatShading:true}),0,.6,-2,words);
  wdGift=new T.Group();wdGift.position.set(0,3,-2);mesh(new T.OctahedronGeometry(1.1,0),std(0xB48CFF,{emissive:0xB48CFF,emissiveIntensity:.9,metalness:.5,roughness:.2,flatShading:true}),0,0,0,wdGift);wdGift.add(glow(0xB48CFF,10,.85));wdGift.visible=false;words.add(wdGift);
})();
function wdHud(){$('cnt').textContent='Words '+WD.done+'/6'+(WD.carry>=0?' · '+WORDS[WD.tiles[WD.carry].item][0]:'');}
function wdReset(){
  WD.done=0;WD.carry=-1;WD.cool=0;WD.miss=0;WD.scr=18;WD.giftOn=false;WD.fin=false;wdGift.visible=false;
  WD.items.forEach(m=>{m.g.visible=false;});
  const pick=shuffle(WORDS.map((w,i)=>i)).slice(0,6),order=shuffle([0,1,2,3,4,5]);
  WD.npcs.forEach((n,i)=>{n.item=pick[i];n.ok=false;const m=WD.items[pick[i]];m.g.visible=true;m.g.position.set(n.ix,2.2,n.iz);reTag(n,'bub','My . . . ?',3,.75);
    const tl=WD.tiles[order[i]],w=WORDS[pick[i]][0];tl.item=pick[i];tl.done=false;tl.scr=0;reTag(tl,'tag',w,3,.75);
    let sc=w;for(let k=0;k<6&&sc===w;k++)sc=shuffle(w.split('')).join('');reTag(tl,'tag2',sc,3,.75);});
}
function wdHide(){WD.npcs.forEach(n=>{if(n.bub)n.bub.visible=false;});WD.tiles.forEach(tl=>{if(tl.tag)tl.tag.visible=false;if(tl.tag2)tl.tag2.visible=false;});}
function wdGuide(){
  if(WD.giftOn)return [0,1.5,-2];
  if(WD.carry>=0)return null;
  let best=null,bd=1e9;WD.tiles.forEach(tl=>{if(!tl.done){const d=Math.hypot(P.x-tl.hx,P.z-tl.hz);if(d<bd){bd=d;best=[tl.hx,0,tl.hz];}}});
  return best;
}
function wdUpdate(t,dt,playing){
  WD.cool-=dt;
  WD.npcs.forEach((n,i)=>{n.g.position.y=n.ok?Math.abs(Math.sin(t*5+i))*.5:0;const m=WD.items[n.item];m.g.rotation.y=t*1.2+i;m.g.position.y=2.2+Math.sin(t*2+i)*.2;if(n.bub){n.bub.visible=true;n.bub.position.set(n.x,4.7+n.g.position.y,n.z);}});
  WD.tiles.forEach((tl,i)=>{
    if(tl.scr>0)tl.scr-=dt;
    const held=WD.carry===i;
    let x=tl.hx,y=.35+Math.sin(t*2+i)*.06,z=tl.hz;
    if(held){x=P.x+Math.sin(P.face)*1.1;y=P.y+1.9;z=P.z+Math.cos(P.face)*1.1;}
    tl.m.visible=!tl.done;tl.m.position.set(x,y,z);tl.m.rotation.y=held?P.face:0;
    const sc=tl.scr>0&&!held;
    if(tl.tag){tl.tag.visible=!tl.done&&!sc;tl.tag.position.set(x,y+1.3,z);}
    if(tl.tag2){tl.tag2.visible=!tl.done&&sc;tl.tag2.position.set(x,y+1.3,z);}
  });
  if(playing&&WD.cool<=0){
    if(WD.carry<0){WD.tiles.some((tl,i)=>{if(tl.done||Math.hypot(P.x-tl.hx,P.z-tl.hz)>1.9)return false;WD.carry=i;WD.cool=.6;tl.scr=0;sfx('click');const w=WORDS[tl.item];toast(heOn?(w[0]+' · '+w[1]):w[0]);wdHud();return true;});}
    else{WD.npcs.some(n=>{if(Math.hypot(P.x-n.x,P.z-n.z)>3)return false;const tl=WD.tiles[WD.carry],w=WORDS[tl.item][0];
      if(n.ok){return false;}
      if(n.item===tl.item){n.ok=true;tl.done=true;WD.carry=-1;WD.done++;WD.cool=.6;reTag(n,'bub',w+'!',3,.75);sfx('spark',WD.done);burst(n.x,3,n.z,0xFFC93C,14);floatText('Yes! '+w,n.x,6,n.z);setXP(G.xp+14);}
      else{WD.miss++;WD.carry=-1;WD.cool=1.1;sfx('hurt');toast('Not my word. "'+w+'" belongs to someone else');}
      wdHud();return true;});}
  }
  if(playing){WD.scr-=dt;if(WD.scr<=0){WD.scr=16+Math.random()*8;const left=WD.tiles.filter((tl,i)=>!tl.done&&WD.carry!==i);
    if(left.length){const s=ACT.shades.find(q=>!q.on&&!(q.dead>0&&q.mode==='roam'));
      if(s){const tl=left[Math.floor(Math.random()*left.length)],a=Math.random()*6.28;s.on=true;s.g.visible=true;s.mode='thief';s.dead=0;s.x=WDC.x+Math.cos(a)*22;s.z=WDC.z+Math.sin(a)*22;s.tx=tl.hx;s.tz=tl.hz;
        s.onHit=()=>{if(!tl.done){tl.scr=14;floatText('Scrambled!',tl.hx,3.4,tl.hz);sfx('hurt');}};toast('A Shade wants to scramble a word! Use PULSE');}}}}
  if(!WD.giftOn&&WD.done>=6){WD.giftOn=true;wdGift.visible=true;setObj('Everyone understands again. Collect the <b>gift</b>','כולם שוב מבינים זה את זה. אספו את המתנה');sfx('compass');burst(0,3,-2,0xB48CFF,24);}
  if(WD.giftOn){wdGift.rotation.y=t*1.2;wdGift.position.y=3+Math.sin(t*1.8)*.3;if(playing&&!WD.fin&&Math.hypot(P.x,P.z+2)<2.8){WD.fin=true;winWords();}}
}

