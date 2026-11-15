/* ---------- ACTION: shades, pulse, hearts, stars, guide arrow ---------- */
const ACT={hearts:3,inv:0,pulseCd:0,time:0,lost:0,kt:0,kx:0,kz:0,ringT:0,thief:14,dispelled:0,shades:[]};
window.__ACT=ACT;
const PAR={town:80,build:100,market:170};
let stars={town:0,build:0,market:0};
try{const s=JSON.parse(localStorage.getItem('eo_stars')||'null');if(s&&typeof s==='object')['town','build','market'].forEach(k=>{const v=parseInt(s[k],10);if(v>=0&&v<=3)stars[k]=v;});}catch(e){}
function starStr(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function awardStars(world){const n=1+(ACT.lost===0?1:0)+(ACT.time<=PAR[world]?1:0);stars[world]=Math.max(stars[world],n);try{localStorage.setItem('eo_stars',JSON.stringify(stars));}catch(e){}return n;}
function makeShade(){
  const g=new T.Group(),m=std(0x565662,{roughness:1,transparent:true,opacity:.9});
  const b=mesh(new T.SphereGeometry(.9,14,10),m,0,1.5,0,g,false);b.scale.set(1,1.2,1);
  mesh(new T.ConeGeometry(.88,1.3,12),m,0,.55,0,g,false).rotation.x=Math.PI;
  [-.32,.32].forEach(x=>mesh(new T.SphereGeometry(.14,8,6),new T.MeshBasicMaterial({color:0xffffff}),x,1.7,.76,g,false));
  g.add(glow(0xb0b0c0,5.5,.3));g.visible=false;scene.add(g);
  return {g:g,on:false,x:0,z:0,hx:0,hz:0,ph:Math.random()*6,dead:0,mode:'roam'};
}
for(let i=0;i<5;i++)ACT.shades.push(makeShade());
const ring=mesh(new T.RingGeometry(.82,1,48),new T.MeshBasicMaterial({color:0x19E3C2,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),0,0,0,scene,false);ring.rotation.x=-Math.PI/2;ring.visible=false;
const guide=new T.Group();guide.visible=false;scene.add(guide);
mesh(new T.ConeGeometry(.55,1.3,4),new T.MeshBasicMaterial({color:0xFFC93C}),0,0,0,guide,false).rotation.x=Math.PI;
guide.add(glow(0xFFC93C,4,.7));
// floating stepping stones in the World of Builders (two blocks sit up there)
[[15.3,1.2,2],[19.6,2.4,-1],[-15.3,1.2,2],[-19.6,2.4,5],[-23.8,3.6,2]].forEach((s,i)=>{
  plats.push({x:s[0],z:s[2],r:2.1,y:s[1]});
  mesh(new T.CylinderGeometry(2.1,1.9,.6,8),std([0x19E3C2,0xFFC93C,0xFF4D8D][i%3],{flatShading:true,roughness:.5}),s[0],s[1]-.3,s[2],build);
  mesh(new T.ConeGeometry(1.8,2.4,8),std(0x8a6a4f,{flatShading:true}),s[0],s[1]-1.8,s[2],build).rotation.x=Math.PI;
});
[[1,19.6,-1,2.4],[5,-23.8,2,3.6]].forEach(b=>{const o=blocks[b[0]];o.x=b[1];o.z=b[2];o.y=b[3];o.g.position.set(b[1],b[3]+1.5,b[2]);});
function hudHearts(){let h='';for(let i=0;i<3;i++)h+='<span style="color:'+(i<ACT.hearts?'#FF4D8D':'rgba(255,255,255,.25)')+'">♥</span>';$('hearts').innerHTML=h;}
function actReset(world){
  ACT.hearts=3;ACT.inv=0;ACT.pulseCd=0;ACT.time=0;ACT.lost=0;ACT.kt=0;ACT.thief=14;ACT.ringT=0;ring.visible=false;
  const spots={town:[[-3,24],[4,4],[-3,-14],[3,-30]],build:[[6,6],[-5,-2],[3,-42]],market:[]}[world]||[];
  ACT.shades.forEach((s,i)=>{const p=spots[i];s.on=!!p;s.g.visible=!!p;s.mode='roam';s.dead=0;if(p){s.x=s.hx=p[0];s.z=s.hz=p[1];}});
  hudHearts();
}
function worldStart(){return G.world==='town'?[0,40]:G.world==='build'?[0,7]:[0,8];}
function hurt(s){
  ACT.hearts--;ACT.lost++;ACT.inv=1.6;hudHearts();sfx('hurt');
  const dx=P.x-s.x,dz=P.z-s.z,d=Math.hypot(dx,dz)||1;ACT.kx=dx/d*15;ACT.kz=dz/d*15;ACT.kt=.22;
  const h=$('hurt');h.style.opacity=.55;setTimeout(()=>{h.style.opacity=0;},140);
  if(ACT.hearts<=0){const w=worldStart();P.x=w[0];P.z=w[1];P.y=0;P.vy=0;ACT.kt=0;ACT.hearts=3;hudHearts();toast('The Collapse caught you. Back to the start');}
  else toast('Ouch! A Shade took a heart');
}
function pulse(){
  if(!(G.state==='town'||G.state==='build'||G.state==='market')||G.busy||G.help||ACT.pulseCd>0)return;
  ACT.pulseCd=2;ACT.ringT=.45;ring.visible=true;ring.position.set(P.x,P.y+.25,P.z);sfx('pulse');
  let n=0;
  ACT.shades.forEach(s=>{if(s.on&&Math.hypot(P.x-s.x,P.z-s.z)<7.5){s.on=false;s.g.visible=false;s.dead=14;n++;ACT.dispelled++;burst(s.x,1.6,s.z,0x19E3C2,14);
    if(G.world==='market'){MK.coins+=2;floatText('+2 coins',s.x,4,s.z);mkHud();}}});
  if(n){setXP(G.xp+5*n);toast(n>1?(n+' Shades cleared!'):'Shade cleared! +5');sfx('spark',5);}
}
function guideTarget(){
  if(G.world==='town'){
    if(G.hasCompass)return portal.visible?[-4.5,0,-40]:null;
    let best=null,bd=1e9;sparks.forEach(s=>{if(s.on){const d=Math.hypot(P.x-s.x,P.z-s.z);if(d<bd){bd=d;best=[s.x,0,s.z];}}});
    return best||[0,1.2,-44];
  }
  if(G.world==='build'){
    if(G.blocks>=6)return [0,1.5,-46];
    let best=null,bd=1e9;blocks.forEach(b=>{if(b.on){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<bd){bd=d;best=[b.x,b.y||0,b.z];}}});
    return best;
  }
  if(MK.giftOn)return [0,1.5,6];
  if(MK.carry)return [STALL.x,5,STALL.z];
  if(MK.stock<3&&MK.coins>=4)return [SUP.x,4.5,SUP.z];
  return null;
}
function actUpdate(t,dt,playing){
  if(playing)ACT.time+=dt;
  if(ACT.inv>0)ACT.inv-=dt;if(ACT.pulseCd>0)ACT.pulseCd-=dt;
  $('pulse').style.opacity=ACT.pulseCd>0?.4:1;
  if(Math.floor(t*2)!==Math.floor((t-dt)*2)){const s=Math.floor(ACT.time);$('timer').textContent=Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
  if(ACT.ringT>0){ACT.ringT-=dt;const k=Math.min(1,1-ACT.ringT/.45),r=1+k*7;ring.scale.set(r,r,r);ring.material.opacity=.85*(1-k);if(ACT.ringT<=0)ring.visible=false;}
  const inWorld=G.state==='town'||G.state==='build'||G.state==='market';
  if(inWorld&&ACT.inv>0)player.visible=Math.floor(t*14)%2===0;
  ACT.shades.forEach(s=>{
    if(!s.on){if(s.dead>0&&s.mode==='roam'&&G.world!=='market'){s.dead-=dt;if(s.dead<=0&&inWorld){s.on=true;s.g.visible=true;s.x=s.hx;s.z=s.hz;}}return;}
    let tx,tz,sp;
    if(s.mode==='thief'){tx=STALL.x;tz=STALL.z+3.2;sp=3.4;}
    else{const leash=G.world==='build'?6:10;
      if(playing&&ACT.inv<=0&&Math.hypot(P.x-s.hx,P.z-s.hz)<leash&&P.y<2.2){tx=P.x;tz=P.z;sp=4.4;}
      else{tx=s.hx+Math.cos(t*.6+s.ph)*3;tz=s.hz+Math.sin(t*.6+s.ph)*3;sp=2.2;}}
    const dx=tx-s.x,dz=tz-s.z,d=Math.hypot(dx,dz);
    if(d>.05){const m=Math.min(sp*dt,d);s.x+=dx/d*m;s.z+=dz/d*m;s.g.rotation.y=Math.atan2(dx,dz);}
    if(G.world==='town')s.x=Math.max(-7,Math.min(7,s.x));
    s.g.position.set(s.x,.25+Math.sin(t*3+s.ph)*.2,s.z);
    if(s.mode==='thief'){if(d<.7){if(MK.stock>0){MK.stock--;floatText('Stolen!',s.x,4,s.z);sfx('hurt');mkHud();}s.on=false;s.g.visible=false;burst(s.x,1.6,s.z,0x9a9aa8,8);}}
    else if(playing&&ACT.inv<=0&&P.y<2.2&&Math.hypot(P.x-s.x,P.z-s.z)<1.5)hurt(s);
  });
  if(G.world==='market'&&playing){ACT.thief-=dt;if(ACT.thief<=0){ACT.thief=16+Math.random()*8;if(MK.stock>0){const s=ACT.shades.find(q=>!q.on);if(s){s.on=true;s.g.visible=true;s.mode='thief';s.dead=0;s.x=(Math.random()<.5?-3:3);s.z=-25;toast('A Shade is after your stock! Use PULSE');}}}}
  const gt=playing?guideTarget():null;guide.visible=!!gt;
  if(gt){guide.position.set(gt[0],gt[1]+4.4+Math.sin(t*4)*.35,gt[2]);guide.rotation.y=t*2;}
}

