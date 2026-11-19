/* ---------- GARDEN WORLD (morning) ---------- */
const skyDawn=skyTex([[0,'#3f8cff'],[.36,'#9fd4ff'],[.5,'#ffe9c4'],[.54,'#ffc7a0'],[.6,'#bfe6ff'],[1,'#9fd4ff']]);
const garden=new T.Group();garden.visible=false;scene.add(garden);
const GD={harvest:0,carry:'',water:0,cool:0,plots:[],wilt:16,giftOn:false,done:false,wilted:0};
window.__GD=GD;
const GDC={x:0,z:-2,r:24},SEED={x:-13,z:6},WELL={x:13,z:6};
let gdGift,seedM,bucketM;
(function buildGarden(){
  const fc=[0xFF4D8D,0xFFC93C,0xffffff,0xB48CFF,0xFF8A3D];
  mesh(new T.CylinderGeometry(27,25.5,1.6,30),std(0x6fd88f,{roughness:.9}),0,-.8,-2,garden);
  mesh(new T.ConeGeometry(25.5,32,30),std(0x8a6a4f,{flatShading:true,roughness:.95}),0,-17.6,-2,garden).rotation.x=Math.PI;
  mesh(new T.CylinderGeometry(15.5,15.5,.06,40),std(0x86e3a2,{roughness:.9}),0,.03,-8,garden,false);
  // plots with three growth stages each
  const fruit=[0xff4b4b,0xFF8A3D,0xFFC93C,0xff4b4b,0xB48CFF,0xFFC93C];
  [[-7,-5],[0,-5],[7,-5],[-7,-12],[0,-12],[7,-12]].forEach((q,i)=>{
    mesh(new T.BoxGeometry(4.4,.5,4.4),std(0x6b4a2f,{roughness:1}),q[0],.25,q[1],garden);
    mesh(new T.BoxGeometry(4.8,.3,4.8),std(0xd9b38c,{roughness:1}),q[0],.12,q[1],garden);
    const g=[new T.Group(),new T.Group(),new T.Group()];
    g.forEach(x=>{x.position.set(q[0],.5,q[1]);x.visible=false;garden.add(x);});
    mesh(new T.ConeGeometry(.22,.7,6),std(0x2fbf71,{flatShading:true}),0,.35,0,g[0]);
    [-.25,.25].forEach(x=>{const l=mesh(new T.SphereGeometry(.2,8,6),std(0x3ddc84),x,.5,0,g[0]);l.scale.set(1.3,.4,.8);});
    mesh(new T.CylinderGeometry(.09,.12,1.3,6),std(0x2fbf71),0,.65,0,g[1]);
    [[-.4,.7],[.4,.9],[0,1.25]].forEach(a=>{const l=mesh(new T.SphereGeometry(.34,8,6),std(0x3ddc84,{flatShading:true}),a[0],a[1],0,g[1]);l.scale.set(1.3,.5,1);});
    mesh(new T.CylinderGeometry(.1,.14,1.6,6),std(0x2fbf71),0,.8,0,g[2]);
    mesh(new T.IcosahedronGeometry(.95,0),std(0x2fbf71,{flatShading:true}),0,1.7,0,g[2]);
    [[-.6,1.5,.5],[.6,1.8,.4],[0,2.3,.6],[.1,1.3,.85],[-.5,2.1,-.4]].forEach(a=>mesh(new T.SphereGeometry(.26,10,8),std(fruit[i],{roughness:.35,emissive:fruit[i],emissiveIntensity:.25}),a[0],a[1],a[2],g[2]));
    const drop=glow(0x4db8ff,2.4,.95);drop.position.set(q[0],3,q[1]);drop.visible=false;garden.add(drop);
    GD.plots.push({x:q[0],z:q[1],stage:0,thirsty:false,timer:0,pop:1,g:g,drop:drop});
  });
  // seed sacks
  [[0,0],[1.3,.4],[-.9,.8]].forEach(a=>{const s=mesh(new T.SphereGeometry(.9,12,10),std(0xE8C07A,{roughness:1}),SEED.x+a[0],.75,SEED.z+a[1],garden);s.scale.set(1,1.1,1);});
  const s1=nameTag('SEEDS');s1.position.set(SEED.x,3.6,SEED.z);s1.scale.set(3.6,.9,1);garden.add(s1);
  // well
  mesh(new T.CylinderGeometry(1.7,1.9,1.4,14),std(0xb8bcc8,{flatShading:true,roughness:.9}),WELL.x,.7,WELL.z,garden);
  mesh(new T.CylinderGeometry(1.35,1.35,.1,14),std(0x2a8cff,{metalness:.6,roughness:.2}),WELL.x,1.35,WELL.z,garden,false);
  [-1.5,1.5].forEach(x=>mesh(new T.CylinderGeometry(.1,.1,3.4,6),std(0x8a5a3a),WELL.x+x,2.3,WELL.z,garden));
  const wr=mesh(new T.ConeGeometry(2.4,1.4,4),std(0xFF4D8D,{flatShading:true}),WELL.x,4.6,WELL.z,garden);wr.rotation.y=Math.PI/4;
  const s2=nameTag('WATER');s2.position.set(WELL.x,6.4,WELL.z);s2.scale.set(3.6,.9,1);garden.add(s2);
  // windmill
  mesh(new T.CylinderGeometry(1.6,2.6,9,10),std(0xfff3df,{flatShading:true}),-17,4.5,-16,garden);
  mesh(new T.ConeGeometry(2.1,2.2,10),std(0xFF4D8D,{flatShading:true}),-17,10.1,-16,garden);
  const blades=new T.Group();blades.position.set(-17,8.2,-14.2);garden.add(blades);
  for(let i=0;i<4;i++){const b=mesh(new T.BoxGeometry(.7,5.2,.12),std(0xffffff,{roughness:.6}),0,2.6,0,new T.Group());b.parent.rotation.z=i*Math.PI/2;blades.add(b.parent);}
  spin.push({w:'garden',f:(t)=>{blades.rotation.z=t*.7;}});
  // pond
  mesh(new T.CylinderGeometry(5,5,.08,24),std(0x2a8cff,{metalness:.7,roughness:.15}),16,.05,-17,garden,false);
  // old tree by the gift
  mesh(new T.CylinderGeometry(.7,1,4,8),std(0x8a5a3a,{flatShading:true}),-4.5,2,10,garden);
  [[0,5.2,0,2.6],[1.8,4.4,.6,1.7],[-1.7,4.6,-.4,1.8]].forEach(a=>mesh(new T.IcosahedronGeometry(a[3],0),std(0xff9ec4,{flatShading:true}),-4.5+a[0],a[1],10+a[2],garden));
  // blossom trees and flowers around the edge
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.2,x=Math.cos(a)*22.5,z=-2+Math.sin(a)*22.5;if(Math.abs(x-SEED.x)<5&&Math.abs(z-SEED.z)<5)continue;mesh(new T.CylinderGeometry(.3,.42,2.2,6),std(0x8a5a3a),x,1.1,z,garden);mesh(new T.IcosahedronGeometry(1.8,0),std(i%2?0xff9ec4:0x2fbf71,{flatShading:true}),x,3.4,z,garden);}
  for(let i=0;i<60;i++){const a=rnd()*Math.PI*2,r=4+rnd()*20,x=Math.cos(a)*r,z=-2+Math.sin(a)*r;if(Math.abs(x)<10&&z<-2&&z>-15)continue;mesh(new T.SphereGeometry(.16,6,5),std(fc[i%5],{emissive:fc[i%5],emissiveIntensity:.2}),x,.22,z,garden,false);}
  // butterflies
  for(let i=0;i<9;i++){const b=glow(fc[i%5],.9,.95);garden.add(b);const bx=(rnd()-.5)*30,bz=-2+(rnd()-.5)*30,ph=rnd()*6,sp=.6+rnd()*.8;spin.push({w:'garden',f:(t)=>{b.position.set(bx+Math.sin(t*sp+ph)*3,2.2+Math.sin(t*3+ph)*.6,bz+Math.cos(t*sp*1.3+ph)*3);}});}
  // far islands, clouds, sun
  [[-75,-10,-80,20],[70,6,-120,24],[-45,20,-170,16],[95,-12,-20,14]].forEach(a=>{mesh(new T.CylinderGeometry(a[3],a[3]*.92,1.4,10),std(0x6fd88f,{flatShading:true}),a[0],a[1]-.7,a[2],garden);mesh(new T.ConeGeometry(a[3]*.93,a[3]*1.3,10),std(0x8a6a4f,{flatShading:true}),a[0],a[1]-1.4-a[3]*.65,a[2],garden).rotation.x=Math.PI;mesh(new T.IcosahedronGeometry(a[3]*.45,0),std(0xff9ec4,{flatShading:true}),a[0],a[1]+a[3]*.5,a[2],garden);});
  for(let i=0;i<10;i++){const g=new T.Group();g.position.set((rnd()-.5)*300,-10+rnd()*55,-60-rnd()*200);for(let k=0;k<4;k++)mesh(new T.SphereGeometry(5+rnd()*6,8,6),std(0xffffff,{flatShading:true,roughness:1}),(k-1.5)*7,rnd()*3,rnd()*4,g,false);garden.add(g);}
  const sg=glow(0xfff2c0,280,.9);sg.position.set(160,120,-400);sg.material.fog=false;garden.add(sg);
  // gift
  mesh(new T.CylinderGeometry(1.3,1.7,1.2,10),std(0xf4f4f8,{flatShading:true}),0,.6,8,garden);
  gdGift=new T.Group();gdGift.position.set(0,3,8);mesh(new T.OctahedronGeometry(1.1,0),std(0x3DDC84,{emissive:0x3DDC84,emissiveIntensity:.9,metalness:.5,roughness:.2,flatShading:true}),0,0,0,gdGift);gdGift.add(glow(0x3DDC84,10,.85));gdGift.visible=false;garden.add(gdGift);
  // carried items
  seedM=mesh(new T.SphereGeometry(.5,10,8),std(0xE8C07A,{roughness:1}),0,0,0,garden);seedM.visible=false;
  bucketM=new T.Group();mesh(new T.CylinderGeometry(.5,.38,.7,12),std(0xb8bcc8,{metalness:.5,roughness:.4}),0,0,0,bucketM);mesh(new T.CylinderGeometry(.44,.44,.06,12),std(0x2a8cff,{metalness:.6,roughness:.2}),0,.33,0,bucketM,false);bucketM.visible=false;garden.add(bucketM);
})();
function gdHud(){$('cnt').textContent='Harvest '+GD.harvest+'/8'+(GD.carry==='seed'?' · Seeds':GD.carry==='water'?' · Water x'+GD.water:'');}
function gdReset(){GD.harvest=0;GD.carry='';GD.water=0;GD.cool=0;GD.wilt=18;GD.giftOn=false;GD.done=false;GD.wilted=0;GD.plots.forEach(p=>{p.stage=0;p.thirsty=false;p.timer=0;p.pop=1;});gdGift.visible=false;}
function gdNear(o,r){return Math.hypot(P.x-o.x,P.z-o.z)<r;}
function gdGuide(){
  if(GD.giftOn)return [0,1.5,8];
  let ripe=null,empty=null,thirsty=null;const bd=[1e9,1e9,1e9];
  GD.plots.forEach(p=>{const d=Math.hypot(P.x-p.x,P.z-p.z);if(p.stage===3&&d<bd[0]){bd[0]=d;ripe=p;}if(p.stage===0&&d<bd[1]){bd[1]=d;empty=p;}if(p.stage>0&&p.thirsty&&d<bd[2]){bd[2]=d;thirsty=p;}});
  if(ripe)return [ripe.x,1,ripe.z];
  if(GD.carry==='water'&&thirsty)return [thirsty.x,1,thirsty.z];
  if(GD.carry==='seed'&&empty)return [empty.x,1,empty.z];
  if(thirsty)return [WELL.x,3.2,WELL.z];
  if(empty)return [SEED.x,1.2,SEED.z];
  return null;
}
function gdUpdate(t,dt,playing){
  GD.cool-=dt;
  seedM.visible=GD.carry==='seed';bucketM.visible=GD.carry==='water';
  const cx=P.x+Math.sin(P.face)*.95,cz=P.z+Math.cos(P.face)*.95;seedM.position.set(cx,P.y+1.8,cz);bucketM.position.set(cx,P.y+1.8,cz);
  if(playing&&GD.cool<=0){
    if(GD.carry!=='seed'&&gdNear(SEED,3.6)){GD.carry='seed';GD.water=0;GD.cool=.7;sfx('click');toast('Picked up seeds');gdHud();}
    else if((GD.carry!=='water'||GD.water<3)&&gdNear(WELL,3.9)){GD.carry='water';GD.water=3;GD.cool=.7;sfx('spark',1);toast('Bucket filled: 3 waterings');gdHud();}
    else GD.plots.some(p=>{
      if(!gdNear(p,2.7))return false;
      if(p.stage===3){p.stage=0;p.thirsty=false;GD.harvest++;GD.cool=.5;sfx('spark',GD.harvest);burst(p.x,2,p.z,0xFFC93C,12);floatText('Harvest! '+GD.harvest+'/8',p.x,4.4,p.z);setXP(G.xp+10);gdHud();return true;}
      if(p.stage===0&&GD.carry==='seed'){p.stage=1;p.thirsty=true;p.timer=0;p.pop=0;GD.carry='';GD.cool=.5;sfx('block',2);toast('Planted. Now it needs water');gdHud();return true;}
      if(p.stage>0&&p.thirsty&&GD.carry==='water'){p.thirsty=false;p.timer=6;GD.water--;if(GD.water<=0)GD.carry='';GD.cool=.5;sfx('pulse');burst(p.x,1.5,p.z,0x4db8ff,8);gdHud();return true;}
      return false;});
  }
  GD.plots.forEach((p,i)=>{
    if(p.stage>0&&p.stage<3&&!p.thirsty){p.timer-=dt;if(p.timer<=0){p.stage++;p.pop=0;if(p.stage<3)p.thirsty=true;else sfx('spark',6);}}
    if(p.pop<1)p.pop=Math.min(1,p.pop+dt*2.5);
    const e=.2+.8*(1-Math.pow(1-p.pop,3));
    p.g.forEach((g,k)=>{g.visible=p.stage===k+1;if(g.visible)g.scale.set(e,e,e);});
    p.drop.visible=p.stage>0&&p.thirsty;if(p.drop.visible)p.drop.position.y=3.4+Math.sin(t*4+i)*.25;
    if(p.stage===3)p.g[2].rotation.y=Math.sin(t*2+i)*.2;
  });
  if(playing){GD.wilt-=dt;if(GD.wilt<=0){GD.wilt=15+Math.random()*8;const live=GD.plots.filter(p=>p.stage>0);
    if(live.length){const s=ACT.shades.find(q=>!q.on&&!(q.dead>0&&q.mode==='roam'));
      if(s){const p=live[Math.floor(Math.random()*live.length)],a=Math.random()*6.28;s.on=true;s.g.visible=true;s.mode='thief';s.dead=0;s.x=GDC.x+Math.cos(a)*22;s.z=GDC.z+Math.sin(a)*22;s.tx=p.x;s.tz=p.z+1.2;
        s.onHit=()=>{if(p.stage>0){if(p.stage===3)p.stage=2;p.thirsty=true;p.timer=0;p.pop=0;GD.wilted++;floatText('Wilted!',p.x,4.4,p.z);sfx('hurt');}};
        toast('A Shade is going for your plants! Use PULSE');}}}}
  if(!GD.giftOn&&GD.harvest>=8){GD.giftOn=true;gdGift.visible=true;setObj('Collect the <b>gift</b> by the old tree','אספו את המתנה ליד העץ הזקן');sfx('compass');burst(0,3,8,0x3DDC84,24);}
  if(GD.giftOn){gdGift.rotation.y=t*1.2;gdGift.position.y=3+Math.sin(t*1.8)*.3;if(playing&&!GD.done&&Math.hypot(P.x,P.z-8)<2.8){GD.done=true;winGarden();}}
}
/* companion pet (unlocked at Rank 4) */
const pet=new T.Group();pet.visible=false;scene.add(pet);
(function(){const b=mesh(new T.SphereGeometry(.42,14,10),std(0x7be0a0,{roughness:.5}),0,0,0,pet);b.scale.set(1,.9,1);mesh(new T.ConeGeometry(.14,.5,6),std(0x2fbf71),0,.55,0,pet).rotation.z=.4;const l=mesh(new T.SphereGeometry(.2,8,6),std(0x2fbf71),.22,.62,0,pet,false);l.scale.set(1.4,.4,.8);[-.15,.15].forEach(x=>mesh(new T.SphereGeometry(.06,8,6),std(0x0E1024),x,.08,.37,pet,false));pet.add(glow(0x7be0a0,2.2,.35));})();
const PET={x:0,y:1.5,z:40};
function petUpdate(t,dt){
  const on=cfg.pet===1&&rank>=4&&(isPlay()||G.state==='custom'||G.state==='win');pet.visible=on;if(!on)return;
  const tx=P.x-Math.sin(P.face)*1.5+Math.cos(P.face)*1.1,tz=P.z-Math.cos(P.face)*1.5-Math.sin(P.face)*1.1,ty=P.y+1.5+Math.sin(t*3)*.2,k=Math.min(1,dt*4);
  if(Math.hypot(tx-PET.x,tz-PET.z)>15){PET.x=tx;PET.z=tz;}
  PET.x+=(tx-PET.x)*k;PET.y+=(ty-PET.y)*k;PET.z+=(tz-PET.z)*k;pet.position.set(PET.x,PET.y,PET.z);pet.rotation.y=Math.atan2(P.x-PET.x,P.z-PET.z);
}

