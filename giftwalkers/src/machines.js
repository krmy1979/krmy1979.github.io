/* ---------- WORLD OF MACHINES (neon night) ---------- */
const skyTech=skyTex([[0,'#020814'],[.4,'#06224a'],[.5,'#0bd3c7'],[.53,'#19E3C2'],[.57,'#06224a'],[1,'#020814']]);
const machines=new T.Group();machines.visible=false;scene.add(machines);
const MC={lvl:0,prog:[],run:false,step:0,st:0,c:0,r:0,d:0,ax:0,az:0,aa:Math.PI,pads:[],walls:[],crashes:0,giftOn:false,fin:false,wasG:true,tag:null};
window.__MC=MC;
const MCC={x:0,z:0,r:23},CELL=2.4,BX=-4.8,BZ=-8.8,DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const LEVELS=[{s:[2,4,0],g:[2,1],w:[]},{s:[0,4,0],g:[3,2],w:[[1,3],[1,4],[4,2]]},{s:[0,4,0],g:[4,0],w:[[0,2],[1,2],[2,2],[4,2]]}];
let mcGift,robot,battery;
function cellX(c){return BX+c*CELL;}function cellZ(r){return BZ+r*CELL;}
(function buildMachines(){
  const nc=[0x19E3C2,0xFF4D8D,0xFFC93C,0x3D7BFF,0xB48CFF];
  mesh(new T.CylinderGeometry(26,24.5,1.6,30),std(0x16223f,{roughness:.35,metalness:.6}),0,-.8,0,machines);
  mesh(new T.ConeGeometry(24.5,30,30),std(0x0b1226,{flatShading:true,metalness:.4}),0,-16.6,0,machines).rotation.x=Math.PI;
  [14,19,24].forEach((r,i)=>{mesh(new T.RingGeometry(r,r+.25,64),new T.MeshBasicMaterial({color:nc[i],transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}),0,.04,0,machines,false).rotation.x=-Math.PI/2;});
  // board
  for(let c=0;c<5;c++)for(let r=0;r<5;r++)mesh(new T.BoxGeometry(CELL-.12,.2,CELL-.12),std((c+r)%2?0x22335c:0x2b4275,{roughness:.4,metalness:.4}),cellX(c),.1,cellZ(r),machines);
  mesh(new T.BoxGeometry(CELL*5+.5,.12,CELL*5+.5),std(0x19E3C2,{emissive:0x19E3C2,emissiveIntensity:.6}),cellX(2),.03,cellZ(2),machines,false);
  for(let i=0;i<5;i++){const w=mesh(new T.BoxGeometry(CELL-.5,1.6,CELL-.5),std(0xFF4D8D,{roughness:.4,emissive:0xFF4D8D,emissiveIntensity:.25}),0,1,0,machines);w.visible=false;MC.walls.push(w);}
  battery=new T.Group();mesh(new T.CylinderGeometry(.5,.5,1.3,14),std(0xFFC93C,{emissive:0xFFC93C,emissiveIntensity:.8,metalness:.5,roughness:.3}),0,0,0,battery);mesh(new T.CylinderGeometry(.22,.22,.2,10),std(0xffffff),0,.75,0,battery);battery.add(glow(0xFFC93C,5,.7));machines.add(battery);
  // robot (faces +z)
  robot=new T.Group();
  mesh(new T.BoxGeometry(1.2,1,1.1),std(0x19E3C2,{roughness:.3,metalness:.4}),0,.9,0,robot);
  mesh(new T.BoxGeometry(.9,.7,.8),std(0xf4f4f8,{roughness:.3,metalness:.3}),0,1.8,0,robot);
  [-.22,.22].forEach(x=>mesh(new T.SphereGeometry(.12,10,8),new T.MeshBasicMaterial({color:0x19E3C2}),x,1.85,.42,robot,false));
  mesh(new T.CylinderGeometry(.03,.03,.5,5),std(0x8a93c8),0,2.4,0,robot);mesh(new T.SphereGeometry(.1,8,6),new T.MeshBasicMaterial({color:0xFF4D8D}),0,2.7,0,robot,false);
  [-.68,.68].forEach(x=>{const w=mesh(new T.CylinderGeometry(.38,.38,.2,14),std(0x0E1024,{roughness:.6}),x,.38,0,robot);w.rotation.z=Math.PI/2;});
  const ar=mesh(new T.ConeGeometry(.3,.6,4),new T.MeshBasicMaterial({color:0xFFC93C}),0,.95,.95,robot,false);ar.rotation.x=Math.PI/2;
  machines.add(robot);
  // command pads
  [['F','FORWARD',0x19E3C2],['L','TURN LEFT',0xFFC93C],['R','TURN RIGHT',0xFF8A3D],['C','CLEAR',0xB48CFF],['G','RUN',0xFF4D8D]].forEach((p,i)=>{
    const x=-9.6+i*4.8,z=8.5;const m=mesh(new T.CylinderGeometry(1.7,1.7,.16,28),std(p[2],{emissive:p[2],emissiveIntensity:.35,roughness:.4}),x,.08,z,machines);
    const l=nameTag(p[1]);l.position.set(x,2.1,z);l.scale.set(3.4,.85,1);machines.add(l);MC.pads.push({k:p[0],x:x,z:z,m:m,armed:true,fl:0});});
  // neon towers, rings, drones
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.1;if(Math.sin(a)>.75)continue;const h=8+rnd()*16,x=Math.cos(a)*23,z=Math.sin(a)*23;mesh(new T.BoxGeometry(2.6,h,2.6),std(0x101a33,{roughness:.4,metalness:.6}),x,h/2,z,machines);
    const c=nc[i%5];mesh(new T.BoxGeometry(.2,h*.9,2.7),new T.MeshBasicMaterial({color:c}),x*.955,h/2,z*.955,machines,false).rotation.y=-a;const tg=glow(c,7,.5);tg.position.set(x,h+.6,z);machines.add(tg);}
  for(let i=0;i<4;i++){const rg=mesh(new T.TorusGeometry(9+i*5,.18,8,60),new T.MeshBasicMaterial({color:nc[i]}),0,14+i*5,-30-i*18,machines,false);const sp=.2+i*.1;spin.push({w:'machines',f:(t)=>{rg.rotation.x=Math.PI/2+Math.sin(t*sp)*.4;rg.rotation.y=t*sp;}});}
  for(let i=0;i<7;i++){const dg=new T.Group();mesh(new T.SphereGeometry(.35,10,8),std(0xf4f4f8,{metalness:.5,roughness:.3}),0,0,0,dg,false);dg.add(glow(nc[i%5],2.4,.8));machines.add(dg);const r=10+rnd()*18,by=6+rnd()*8,sp=.25+rnd()*.3,ph=rnd()*6;spin.push({w:'machines',f:(t)=>{dg.position.set(Math.cos(t*sp+ph)*r,by+Math.sin(t*1.5+ph),Math.sin(t*sp+ph)*r);}});}
  [[-80,-6,-90,20],[78,8,-125,24],[-42,22,-175,16]].forEach((a,i)=>{mesh(new T.CylinderGeometry(a[3],a[3]*.92,1.4,10),std(0x16223f,{flatShading:true,metalness:.5}),a[0],a[1]-.7,a[2],machines);mesh(new T.BoxGeometry(4,22,4),std(0x101a33),a[0],a[1]+11,a[2],machines);const tg=glow(nc[i],40,.5);tg.position.set(a[0],a[1]+24,a[2]);machines.add(tg);});
  mesh(new T.CylinderGeometry(1.3,1.7,1.2,10),std(0xf4f4f8,{flatShading:true}),0,.6,13.5,machines);
  mcGift=new T.Group();mcGift.position.set(0,3,13.5);mesh(new T.OctahedronGeometry(1.1,0),std(0x3D7BFF,{emissive:0x3D7BFF,emissiveIntensity:.9,metalness:.5,roughness:.2,flatShading:true}),0,0,0,mcGift);mcGift.add(glow(0x3D7BFF,10,.85));mcGift.visible=false;machines.add(mcGift);
})();
function mcProgText(){return MC.prog.length?MC.prog.join(' '):'no commands yet';}
function mcHud(){$('cnt').textContent='Puzzle '+Math.min(3,MC.lvl+1)+'/3 · '+mcProgText();if(G.world==='machines'){const s=reTag(MC,'tag',MC.prog.length?MC.prog.join(' '):'PROGRAM',6,1.5);s.position.set(cellX(2),6.2,cellZ(2));s.visible=true;}}
function mcRobotHome(){const L=LEVELS[Math.min(2,MC.lvl)];MC.c=L.s[0];MC.r=L.s[1];MC.d=L.s[2];}
function mcLoad(){const L=LEVELS[Math.min(2,MC.lvl)];mcRobotHome();MC.prog=[];MC.run=false;MC.step=0;MC.st=0;MC.ax=cellX(MC.c);MC.az=cellZ(MC.r);MC.aa=Math.PI-MC.d*Math.PI/2;
  MC.walls.forEach((w,i)=>{const q=L.w[i];w.visible=!!q;if(q)w.position.set(cellX(q[0]),1,cellZ(q[1]));});battery.position.set(cellX(L.g[0]),1.2,cellZ(L.g[1]));battery.visible=true;}
function mcReset(){MC.lvl=0;MC.crashes=0;MC.giftOn=false;MC.fin=false;mcGift.visible=false;MC.pads.forEach(p=>{p.armed=true;p.fl=0;});mcLoad();}
function mcHide(){if(MC.tag)MC.tag.visible=false;}
function mcBlocked(c,r){if(c<0||c>4||r<0||r>4)return true;return LEVELS[Math.min(2,MC.lvl)].w.some(q=>q[0]===c&&q[1]===r);}
function mcFail(msg){MC.crashes++;MC.run=false;MC.prog=[];mcRobotHome();sfx('hurt');toast(msg);mcHud();}
function mcPress(p){
  if(MC.run||MC.giftOn)return;p.fl=.25;
  if(p.k==='C'){MC.prog=[];sfx('click');}
  else if(p.k==='G'){if(!MC.prog.length){toast('Write a program first');return;}mcRobotHome();MC.run=true;MC.step=0;MC.st=.25;sfx('pulse');}
  else{if(MC.prog.length>=14){toast('The program is full. RUN it or CLEAR it');return;}MC.prog.push(p.k);sfx('click');}
  mcHud();
}
function mcGuide(){
  if(MC.giftOn)return [0,1.5,13.5];
  if(MC.lvl===0&&!MC.run){const p=MC.pads[MC.prog.length<3?0:4];return [p.x,0,p.z];}
  return null;
}
function mcUpdate(t,dt,playing){
  const landed=P.ground&&!MC.wasG;MC.wasG=P.ground;
  MC.pads.forEach(p=>{const d=Math.hypot(P.x-p.x,P.z-p.z);if(p.fl>0)p.fl-=dt;p.m.material.emissiveIntensity=p.fl>0?1.2:.35;p.m.position.y=p.fl>0?.02:.08;
    if(d>2.4)p.armed=true;else if(d<1.7&&playing&&P.y<.6&&(p.armed||landed)){p.armed=false;mcPress(p);}});
  if(MC.run){MC.st-=dt;if(MC.st<=0){MC.st=.42;
    if(MC.step>=MC.prog.length){mcFail('The robot stopped before the battery. Program cleared');}
    else{const k=MC.prog[MC.step++];
      if(k==='L')MC.d=(MC.d+3)%4;else if(k==='R')MC.d=(MC.d+1)%4;
      else{const nc2=MC.c+DIRS[MC.d][0],nr=MC.r+DIRS[MC.d][1];if(mcBlocked(nc2,nr)){mcFail('Crash! The robot hit a wall. Program cleared');}else{MC.c=nc2;MC.r=nr;sfx('step');}}
      const L=LEVELS[Math.min(2,MC.lvl)];
      if(MC.run&&MC.c===L.g[0]&&MC.r===L.g[1]){MC.run=false;MC.lvl++;sfx('spark',MC.lvl+3);burst(cellX(MC.c),2,cellZ(MC.r),0xFFC93C,18);setXP(G.xp+28);
        if(MC.lvl>=3){MC.giftOn=true;battery.visible=false;MC.prog=[];mcGift.visible=true;setObj('All 3 puzzles solved. Collect the <b>gift</b>','כל 3 החידות נפתרו. אספו את המתנה');sfx('compass');}
        else{toast('Solved! Now puzzle '+(MC.lvl+1)+' of 3');const keepX=cellX(MC.c),keepZ=cellZ(MC.r);mcLoad();MC.ax=keepX;MC.az=keepZ;}
        mcHud();}}}}
  const tx=cellX(MC.c),tz=cellZ(MC.r),ta=Math.PI-MC.d*Math.PI/2,k=Math.min(1,dt*9);
  MC.ax+=(tx-MC.ax)*k;MC.az+=(tz-MC.az)*k;let da=ta-MC.aa;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;MC.aa+=da*k;
  robot.position.set(MC.ax,.2+Math.abs(Math.sin(t*6))*(MC.run?.08:.02),MC.az);robot.rotation.y=MC.aa;
  battery.rotation.y=t*1.5;battery.position.y=1.2+Math.sin(t*2.5)*.15;
  if(MC.giftOn){mcGift.rotation.y=t*1.2;mcGift.position.y=3+Math.sin(t*1.8)*.3;if(playing&&!MC.fin&&Math.hypot(P.x,P.z-13.5)<2.8){MC.fin=true;winMachines();}}
}

