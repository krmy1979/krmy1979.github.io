/* ---------- MARKET WORLD (sunset) ---------- */
const skySunset=skyTex([[0,'#2a1b6b'],[.3,'#7a3fa0'],[.46,'#ff7a6b'],[.52,'#ffd27a'],[.56,'#ff9a6b'],[.7,'#7a3fa0'],[1,'#2a1b6b']]);
const market=new T.Group();market.visible=false;scene.add(market);
const MK={coins:12,stock:0,price:5,carry:0,sold:0,refused:0,cool:0,spawn:0,npcs:[],pads:[],stockM:[],labels:[],giftOn:false,done:false};
window.__MK=MK;
const MKC={x:0,z:-4,r:23},SUP={x:-10,z:-6},STALL={x:9,z:-6},BUYP={3:1,5:.7,8:.25};
let mkGift,crate;
(function buildMarket(){
  const tc=[0xFF4D8D,0x19E3C2,0xFFC93C,0x3D7BFF,0x7B4DFF,0xFF8A3D];
  // plaza island
  mesh(new T.CylinderGeometry(26,24.5,1.6,28),std(0xE8B878,{roughness:.9}),0,-.8,-4,market);
  mesh(new T.ConeGeometry(24.5,30,28),std(0x9a6a4f,{flatShading:true,roughness:.95}),0,-16.6,-4,market).rotation.x=Math.PI;
  [9,16].forEach(r=>{mesh(new T.RingGeometry(r,r+.5,56),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false}),0,.03,-4,market,false).rotation.x=-Math.PI/2;});
  // tents around the plaza
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2+.26;if(Math.sin(a)<-.8)continue;
    const g=new T.Group();g.position.set(Math.cos(a)*20,0,-4+Math.sin(a)*20);
    const c=tc[i%6];
    mesh(new T.BoxGeometry(4.2,1.2,2),std(0xfff3df,{roughness:.8}),0,.6,0,g);
    [[-2,-.9],[2,-.9],[-2,.9],[2,.9]].forEach(p=>mesh(new T.CylinderGeometry(.08,.08,3.4,6),std(0x8a5a3a),p[0],1.7,p[1],g));
    const roof=mesh(new T.ConeGeometry(3.5,1.9,4),std(c,{roughness:.6,flatShading:true}),0,4.3,0,g);roof.rotation.y=Math.PI/4;
    for(let k=0;k<4;k++)mesh(new T.SphereGeometry(.28,10,8),std(tc[(i+k+2)%6],{roughness:.4}),-1.3+k*.85,1.45,0,g);
    const lg=glow(0xffc46b,6,.55);lg.position.set(0,3.1,0);g.add(lg);
    g.lookAt(0,0,-4);market.add(g);
  }
  // string lights
  for(let i=0;i<44;i++){const a=i/44*Math.PI*2;const m=mesh(new T.SphereGeometry(.2,8,6),new T.MeshBasicMaterial({color:tc[i%6]}),Math.cos(a)*14,6.2+Math.sin(a*6)*.7,-4+Math.sin(a)*14,market,false);if(i%2===0){const s=glow(tc[i%6],2.6,.6);s.position.copy(m.position);market.add(s);}}
  [0,1,2,3,4,5].forEach(i=>{const a=i/6*Math.PI*2+.5;mesh(new T.CylinderGeometry(.12,.16,6.6,8),std(0x5a3f2e),Math.cos(a)*14,3.3,-4+Math.sin(a)*14,market);});
  // gate
  [-4,4].forEach(x=>mesh(new T.BoxGeometry(1.4,8,1.4),std(0xfff3df,{roughness:.7}),x,4,-27,market));
  mesh(new T.BoxGeometry(11,1.6,1.6),std(0xFF4D8D,{emissive:0xFF4D8D,emissiveIntensity:.35}),0,8.6,-27,market);
  const gs=nameTag('MARKET');gs.position.set(0,10.6,-27);gs.scale.set(7,1.75,1);market.add(gs);
  // balloons
  for(let i=0;i<6;i++){const g=new T.Group();const bx=(i%2?1:-1)*(40+rnd()*60),by=14+rnd()*30,bz=-40-rnd()*120;g.position.set(bx,by,bz);const s=mesh(new T.SphereGeometry(6,16,12),std(tc[i%6],{roughness:.5}),0,0,0,g,false);s.scale.set(1,1.15,1);mesh(new T.BoxGeometry(2,1.6,2),std(0x8a5a3a),0,-9,0,g,false);market.add(g);const ph=rnd()*6;spin.push({w:'market',f:(t)=>{g.position.y=by+Math.sin(t*.4+ph)*2.5;g.rotation.y=t*.1;}});}
  // far islands
  [[-80,-12,-90,20],[75,4,-130,26],[-50,18,-180,16],[100,-10,-30,15]].forEach(a=>{mesh(new T.CylinderGeometry(a[3],a[3]*.92,1.4,10),std(0xE8B878,{flatShading:true}),a[0],a[1]-.7,a[2],market);mesh(new T.ConeGeometry(a[3]*.93,a[3]*1.3,10),std(0x9a6a4f,{flatShading:true}),a[0],a[1]-1.4-a[3]*.65,a[2],market).rotation.x=Math.PI;mesh(new T.CylinderGeometry(2,3,10,8),std(tc[Math.floor(rnd()*6)],{flatShading:true}),a[0],a[1]+5,a[2],market);});
  const sg=glow(0xffb070,300,.95);sg.position.set(120,60,-420);sg.material.fog=false;market.add(sg);
  // supplier
  [[0,.7,0],[1.5,.7,.2],[-1.4,.7,-.3],[.2,2.1,0],[1.3,2.1,.1],[.7,3.5,0]].forEach((p,i)=>mesh(new T.BoxGeometry(1.35,1.35,1.35),std(i%2?0x9a6a3f:0x8a5a3a,{roughness:.8}),SUP.x+p[0],p[1],SUP.z+p[2],market));
  const s1=nameTag('SUPPLIER · 4 coins');s1.position.set(SUP.x,5.6,SUP.z);s1.scale.set(5.2,1.3,1);market.add(s1);
  // your stand
  mesh(new T.BoxGeometry(5.2,1.3,2.2),std(0xfff3df,{roughness:.7}),STALL.x,.65,STALL.z,market);
  [[-2.5,-1],[2.5,-1],[-2.5,1],[2.5,1]].forEach(p=>mesh(new T.CylinderGeometry(.1,.1,4,6),std(0x8a5a3a),STALL.x+p[0],2,STALL.z+p[1],market));
  const rf=mesh(new T.ConeGeometry(4.2,2.2,4),std(0x19E3C2,{roughness:.5,flatShading:true}),STALL.x,5.1,STALL.z,market);rf.rotation.y=Math.PI/4;
  const s2=nameTag('YOUR STAND');s2.position.set(STALL.x,7,STALL.z);s2.scale.set(4.6,1.15,1);market.add(s2);
  for(let i=0;i<9;i++){const m=mesh(new T.BoxGeometry(.42,.42,.42),std(tc[i%6],{roughness:.4,emissive:tc[i%6],emissiveIntensity:.25}),STALL.x-2+ (i%5)*1,1.55+Math.floor(i/5)*.46,STALL.z+(i<5?.3:-.1),market);m.visible=false;MK.stockM.push(m);}
  // price pads
  [[3,4.5],[5,9],[8,13.5]].forEach((p,i)=>{const c=[0x3DDC84,0xFFC93C,0xFF4D8D][i];const m=mesh(new T.CylinderGeometry(1.6,1.6,.14,28),std(c,{emissive:c,emissiveIntensity:.05,roughness:.5}),p[1],.07,1.5,market);const l=nameTag(p[0]+' coins');l.position.set(p[1],1.9,1.5);l.scale.set(3,.75,1);market.add(l);MK.pads.push({v:p[0],x:p[1],z:1.5,m:m});});
  const s3=nameTag('STEP ON A PRICE');s3.position.set(9,3.2,1.5);s3.scale.set(4.4,1.1,1);market.add(s3);
  // gift
  mesh(new T.CylinderGeometry(1.3,1.7,1.2,10),std(0xf4f4f8,{flatShading:true}),0,.6,6,market);
  mkGift=new T.Group();mkGift.position.set(0,3,6);mesh(new T.OctahedronGeometry(1.1,0),std(0xFF4D8D,{emissive:0xFF4D8D,emissiveIntensity:.9,metalness:.6,roughness:.2,flatShading:true}),0,0,0,mkGift);mkGift.add(glow(0xFF4D8D,10,.85));mkGift.visible=false;market.add(mkGift);
  // carried crate
  crate=mesh(new T.BoxGeometry(.95,.95,.95),std(0x9a6a3f,{roughness:.8}),0,0,0,market);crate.visible=false;
  // customers
  const skins=[0xF6D3B3,0xE2A66F,0xC68642,0x8D5A3B,0x5C3A21];
  for(let i=0;i<5;i++){const g=new T.Group();mesh(new T.CylinderGeometry(.5,.62,1.5,12),std(tc[(i*2+1)%6],{roughness:.6}),0,1.35,0,g);const h=mesh(new T.SphereGeometry(.55,16,12),std(skins[i],{roughness:.6}),0,2.55,0,g);mesh(new T.SphereGeometry(.58,16,10,0,Math.PI*2,0,Math.PI*.5),std(tc[(i*3)%6],{roughness:.5}),0,2.62,0,g);[-.2,.2].forEach(x=>mesh(new T.SphereGeometry(.07,8,6),std(0x0E1024),x,2.6,.5,g,false));[-.24,.24].forEach(x=>mesh(new T.CylinderGeometry(.18,.16,.7,8),std(0x2A3142),x,.35,0,g));g.visible=false;market.add(g);MK.npcs.push({g:g,on:false,x:0,z:0,st:0,wait:0,ex:0});}
})();
function mkHud(){$('cnt').textContent='Coins '+MK.coins+' · Stock '+MK.stock+' · Price '+MK.price;}
function mkReset(){MK.coins=12;MK.stock=0;MK.price=5;MK.carry=0;MK.sold=0;MK.refused=0;MK.cool=0;MK.spawn=2;MK.giftOn=false;MK.done=false;MK.npcs.forEach(n=>{n.on=false;n.g.visible=false;});mkGift.visible=false;}
function floatText(text,x,y,z){const s=nameTag(text);s.position.set(x,y,z);s.scale.set(3.2,.8,1);scene.add(s);MK.labels.push({s:s,l:1.4,y:y});}
function labelsUpdate(dt){for(let i=MK.labels.length-1;i>=0;i--){const L=MK.labels[i];L.l-=dt;L.y+=dt*1.3;L.s.position.y=L.y;L.s.material.opacity=Math.max(0,Math.min(1,L.l*2));if(L.l<=0){scene.remove(L.s);try{L.s.material.map.dispose();L.s.material.dispose();}catch(e){}MK.labels.splice(i,1);}}}
function mkUpdate(t,dt,playing){
  crate.visible=MK.carry>0;if(MK.carry>0)crate.position.set(P.x+Math.sin(P.face)*.95,P.y+1.9,P.z+Math.cos(P.face)*.95);
  MK.cool-=dt;
  if(playing){
    if(MK.cool<=0&&!MK.carry&&Math.hypot(P.x-SUP.x,P.z-SUP.z)<4.4){
      if(MK.coins>=4){MK.coins-=4;MK.carry=1;MK.cool=.8;sfx('block',1);toast('Bought a crate for 4 coins');mkHud();}
      else{MK.cool=2.5;toast('Not enough coins. Sell first');}}
    if(MK.cool<=0&&MK.carry&&Math.hypot(P.x-STALL.x,P.z-STALL.z)<4.6){
      if(MK.stock<=6){MK.stock+=3;MK.carry=0;MK.cool=.8;sfx('spark',2);toast('Stand stocked: +3 items');mkHud();}
      else{MK.cool=2.5;toast('Your stand is full');}}
    MK.pads.forEach(p=>{if(MK.price!==p.v&&Math.hypot(P.x-p.x,P.z-p.z)<1.6){MK.price=p.v;sfx('click');toast('Price set to '+p.v+' coins');mkHud();}});
    MK.spawn-=dt;
    if(MK.spawn<=0){MK.spawn=2.4+Math.random()*1.6;const n=MK.npcs.find(q=>!q.on);if(n){n.on=true;n.g.visible=true;n.x=(Math.random()-.5)*5;n.z=-25;n.st=0;n.wait=0;}}
  }
  MK.pads.forEach(p=>{p.m.material.emissiveIntensity=MK.price===p.v?.95:.05;});
  MK.stockM.forEach((m,i)=>{m.visible=i<MK.stock;});
  MK.npcs.forEach((n,i)=>{
    if(!n.on)return;
    const tx=n.st===0?STALL.x-2+i:n.ex,tz=n.st===0?STALL.z+3.3:-26.5;
    const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);
    if(n.st===1&&n.wait>0){n.wait-=dt;}
    else if(d>.3){const sp=Math.min(5.5*dt,d);n.x+=dx/d*sp;n.z+=dz/d*sp;n.g.rotation.y=Math.atan2(dx,dz);}
    else if(n.st===0){
      n.st=1;n.wait=1;n.ex=(Math.random()-.5)*8;n.g.rotation.y=Math.PI;
      if(MK.stock<=0){MK.refused++;floatText('Sold out!',n.x,4,n.z);sfx('click');}
      else if(Math.random()<BUYP[MK.price]){MK.stock--;MK.coins+=MK.price;MK.sold++;floatText('+'+MK.price+' coins',n.x,4,n.z);sfx('spark',4);burst(n.x,2.6,n.z,0xFFC93C,8);mkHud();}
      else{MK.refused++;floatText('Too pricey!',n.x,4,n.z);sfx('click');}
    }else{n.on=false;n.g.visible=false;}
    n.g.position.set(n.x,(n.st===1&&n.wait>0)?0:Math.abs(Math.sin(t*9+i))*.16,n.z);
  });
  if(!MK.giftOn&&MK.coins>=40){MK.giftOn=true;mkGift.visible=true;setObj('You did it! Collect the <b>gift</b> in the plaza','הצלחתם! אספו את המתנה בכיכר');sfx('compass');burst(0,3,6,0xFF4D8D,24);}
  if(MK.giftOn){mkGift.rotation.y=t*1.2;mkGift.position.y=3+Math.sin(t*1.8)*.3;if(playing&&!MK.done&&Math.hypot(P.x,P.z-6)<2.8){MK.done=true;winMarket();}}
}

