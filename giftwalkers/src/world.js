/* ---------- helpers ---------- */
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
const glowTex=canvasTex(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
function glow(color,size,op){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:color,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:op==null?1:op}));s.scale.set(size,size,1);return s;}
function std(color,o){return new T.MeshStandardMaterial(Object.assign({color:color,roughness:.6,metalness:.05},o||{}));}
function mesh(geo,mat,x,y,z,parent,shadow){const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(shadow!==false){m.castShadow=true;m.receiveShadow=true;}if(parent)parent.add(m);return m;}
let seed=11;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}

/* ---------- sky ---------- */
function skyTex(stops){return canvasTex(8,512,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);stops.forEach(s=>r.addColorStop(s[0],s[1]));g.fillStyle=r;g.fillRect(0,0,w,h);});}
const skyNight=skyTex([[0,'#03041a'],[.42,'#141a55'],[.5,'#5a2a8a'],[.535,'#ff5f8f'],[.56,'#12163f'],[1,'#05061a']]);
const skyDay=skyTex([[0,'#1f5bff'],[.38,'#58b8ff'],[.5,'#c9f1ff'],[.54,'#ffe6b0'],[.6,'#8fd0ff'],[1,'#58b8ff']]);
const sky=new T.Mesh(new T.SphereGeometry(700,24,16),new T.MeshBasicMaterial({map:skyNight,side:T.BackSide,fog:false,depthWrite:false}));
scene.add(sky);
const hemi=new T.HemisphereLight(0x6677dd,0x1a1030,.7);scene.add(hemi);
const sun=new T.DirectionalLight(0x9fb4ff,.75);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;sun.shadow.camera.far=120;sun.shadow.bias=-0.0015;
scene.add(sun);scene.add(sun.target);

/* ---------- TOWN (night) ---------- */
const town=new T.Group();scene.add(town);
const spin=[];   // things that animate: {m, f(t,dt)}
(function buildTown(){
  // stars
  const sp=[];for(let i=0;i<900;i++){const a=rnd()*Math.PI*2,e=rnd()*1.3+.08,r=600;sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r);}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));
  town.add(new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:2.2,sizeAttenuation:false,fog:false,transparent:true,opacity:.9})));
  // moon
  const moon=mesh(new T.SphereGeometry(26,24,18),new T.MeshBasicMaterial({color:0xfff3d6,fog:false}),150,190,-420,town,false);
  const mg=glow(0xbfd0ff,220,.55);mg.position.copy(moon.position);mg.material.fog=false;town.add(mg);
  // promenade
  mesh(new T.BoxGeometry(18,1,96),std(0x2b2f52,{roughness:.35,metalness:.3}),0,-.5,-2,town);
  for(let z=42;z>-48;z-=6){mesh(new T.BoxGeometry(17.6,.04,.25),std(0x3d4378,{emissive:0x19E3C2,emissiveIntensity:.25}),0,.02,z,town,false);}
  // sea
  const seaGeo=new T.PlaneGeometry(520,520,56,56);seaGeo.rotateX(-Math.PI/2);
  const sea=mesh(seaGeo,std(0x0c2f8a,{roughness:.18,metalness:.75,flatShading:true}),60,-1.6,-20,town,false);sea.receiveShadow=true;
  const base=seaGeo.attributes.position.array.slice();
  spin.push({w:'town',f:(t)=>{const p=seaGeo.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],z=base[i*3+2];p.setY(i,Math.sin(x*.11+t*1.1)*.45+Math.cos(z*.14+t*.8)*.35);}p.needsUpdate=true;seaGeo.computeVertexNormals();}});
  // buildings with lit windows
  const wcols=['#FFC93C','#FFE9A8','#19E3C2','#FF4D8D','#9fb4ff'];
  function winTex(){return canvasTex(128,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(let y=10;y<h-10;y+=22)for(let x=10;x<w-14;x+=22){if(rnd()<.55){g.fillStyle=wcols[Math.floor(rnd()*wcols.length)];g.globalAlpha=.55+rnd()*.45;g.fillRect(x,y,12,14);}}g.globalAlpha=1;});}
  const bcol=[0x1d2145,0x232a5c,0x2b1f4f,0x1a2b55];
  for(let z=44;z>-40;z-=10.5){
    for(let row=0;row<2;row++){
      const w=8+rnd()*2,h=(row?16:9)+rnd()*14,d=8;
      const m=std(bcol[Math.floor(rnd()*4)],{roughness:.8,emissive:0xffffff,emissiveMap:winTex(),emissiveIntensity:row?.75:1.1});
      mesh(new T.BoxGeometry(w,h,d),m,-14-row*11,h/2-1,z,town);
    }
    // neon sign
    const nc=[0xFF4D8D,0x19E3C2,0xFFC93C][Math.floor(rnd()*3)];
    mesh(new T.BoxGeometry(.3,1.1,3.4),new T.MeshBasicMaterial({color:nc}),-9.75,4.2,z,town,false);
    const ng=glow(nc,9,.5);ng.position.set(-9.4,4.2,z);town.add(ng);
  }
  // railing + lamps
  mesh(new T.BoxGeometry(.2,.15,96),std(0x8a93c8,{metalness:.8,roughness:.3}),8.7,1.1,-2,town);
  let lights=0;
  for(let z=40;z>-46;z-=9){
    mesh(new T.CylinderGeometry(.09,.12,1.2,8),std(0x8a93c8,{metalness:.8,roughness:.3}),8.7,.55,z+4.5,town);
    mesh(new T.CylinderGeometry(.12,.18,5.2,8),std(0x30365f,{metalness:.6,roughness:.4}),7.9,2.6,z,town);
    mesh(new T.SphereGeometry(.42,14,10),new T.MeshBasicMaterial({color:0xffe2a0}),7.9,5.4,z,town,false);
    const lg=glow(0xffc46b,7,.7);lg.position.set(7.9,5.4,z);town.add(lg);
    if(lights<4&&(Math.round(z)%2===0||lights<2)){const pl=new T.PointLight(0xffb45e,1.1,26,2);pl.position.set(6.8,5,z);town.add(pl);lights++;}
  }
  // lighthouse rock + tower
  mesh(new T.CylinderGeometry(13,16,5,9),std(0x3a3554,{flatShading:true,roughness:.95}),0,-2.5,-56,town);
  mesh(new T.CylinderGeometry(2.3,3.6,24,20),std(0xf4f4f8,{roughness:.5}),0,12,-58,town);
  [5,13,20].forEach(y=>mesh(new T.CylinderGeometry(2.3+ (24-y)*.054+.04,2.3+(24-y)*.054+.14,2.4,20),std(0xFF4D8D,{roughness:.45}),0,y,-58,town));
  mesh(new T.CylinderGeometry(3.1,3.1,.5,20),std(0x30365f),0,24.2,-58,town);
  mesh(new T.CylinderGeometry(1.9,1.9,2.6,12),std(0x1b1f3b,{metalness:.6,roughness:.3}),0,25.8,-58,town);
  mesh(new T.ConeGeometry(2.6,2.6,12),std(0xFF4D8D),0,28.4,-58,town);
  // pedestal + compass
  mesh(new T.CylinderGeometry(1.1,1.5,1.4,10),std(0x4a4f7d,{flatShading:true}),0,.7,-44,town);
})();
const lampCore=mesh(new T.SphereGeometry(1.1,16,12),new T.MeshBasicMaterial({color:0x2a2f52}),0,25.8,-58,town,false);
const lampGlow=glow(0x19E3C2,1,0);lampGlow.position.set(0,25.8,-58);town.add(lampGlow);
const beamGeo=new T.CylinderGeometry(9,.4,160,20,1,true);beamGeo.translate(0,80,0);
const beam=mesh(beamGeo,new T.MeshBasicMaterial({color:0x19E3C2,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}),0,26,-58,town,false);
const compass=new T.Group();compass.position.set(0,2.6,-44);town.add(compass);
mesh(new T.TorusGeometry(.7,.13,10,28),std(0xFFC93C,{metalness:.9,roughness:.2,emissive:0xFFC93C,emissiveIntensity:.35}),0,0,0,compass);
mesh(new T.BoxGeometry(.16,1.1,.08),new T.MeshBasicMaterial({color:0xFF4D8D}),0,0,0,compass,false);
const cGlow=glow(0x19E3C2,6,.8);compass.add(cGlow);
// sparks
const sparks=[];[[-4,30],[4.5,18],[-3.5,6],[4,-8],[-2,-24]].forEach(p=>{const g=new T.Group();g.position.set(p[0],1.6,p[1]);mesh(new T.IcosahedronGeometry(.42,0),new T.MeshBasicMaterial({color:0x9ffff0}),0,0,0,g,false);g.add(glow(0x19E3C2,4.5,.9));town.add(g);sparks.push({g:g,x:p[0],z:p[1],on:true});});
// portal
const portal=new T.Group();portal.position.set(-4.5,3.4,-40);portal.rotation.y=.5;portal.visible=false;town.add(portal);
const pRing=mesh(new T.TorusGeometry(3,.34,14,48),new T.MeshBasicMaterial({color:0xFF4D8D}),0,0,0,portal,false);
const pDisc=mesh(new T.CircleGeometry(2.8,40),new T.MeshBasicMaterial({color:0x19E3C2,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),0,0,0,portal,false);
const pDisc2=mesh(new T.RingGeometry(1.2,2.7,40,1),new T.MeshBasicMaterial({color:0xFFC93C,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),0,0,.05,portal,false);
portal.add(glow(0xFF4D8D,16,.7));
const pLight=new T.PointLight(0x19E3C2,0,40,2);pLight.position.copy(portal.position);town.add(pLight);

/* ---------- BUILDERS WORLD (day) ---------- */
const build=new T.Group();build.visible=false;scene.add(build);
const plats=[];  // {x,z,r} circles or {x0,x1,z0,z1} boxes, top at y=0
const blocks=[],segs=[];
let gift;
(function buildBuilders(){
  function island(x,y,z,r,top){
    mesh(new T.CylinderGeometry(r,r*.92,1.4,10),std(top,{flatShading:true,roughness:.85}),x,y-.7,z,build);
    mesh(new T.ConeGeometry(r*.93,r*1.3,10),std(0x8a6a4f,{flatShading:true,roughness:.95}),x,y-1.4-r*.65,z,build).rotation.x=Math.PI;
  }
  island(0,0,2,13,0x5fd38a);plats.push({x:0,z:2,r:12.6});
  island(0,0,-44,13,0x5fd38a);plats.push({x:0,z:-44,r:12.6});
  // far decorative islands
  [[-70,-10,-90,22],[65,8,-120,26],[-40,22,-170,18],[90,-14,-40,16],[-95,6,10,14]].forEach(a=>island(a[0],a[1],a[2],a[3],[0x5fd38a,0x7be0a0,0xffd166][Math.floor(rnd()*3)]));
  // giant floating cubes
  const cc=[0xFFC93C,0x19E3C2,0xFF4D8D,0x3D7BFF,0xffffff];
  for(let i=0;i<34;i++){const s=1.5+rnd()*5;const m=mesh(new T.BoxGeometry(s,s,s),std(cc[i%5],{roughness:.35,metalness:.15}),(rnd()-.5)*220,(rnd()-.3)*70,-30-rnd()*200,build);m.rotation.set(rnd()*3,rnd()*3,rnd()*3);const sp=.1+rnd()*.3,by=m.position.y,ph=rnd()*6;if(Math.abs(m.position.x)<16&&m.position.z>-60){m.position.x+=m.position.x<0?-22:22;}spin.push({w:'build',f:(t)=>{m.rotation.y+=.003*sp*10;m.position.y=by+Math.sin(t*sp+ph)*1.5;}});}
  // clouds
  for(let i=0;i<14;i++){const g=new T.Group();g.position.set((rnd()-.5)*320,-18+rnd()*60,-60-rnd()*220);for(let k=0;k<5;k++){const r=5+rnd()*7;mesh(new T.SphereGeometry(r,8,6),std(0xffffff,{flatShading:true,roughness:1}),(k-2)*7+rnd()*3,rnd()*3,rnd()*5,g,false);}build.add(g);const sx=1+rnd()*2;spin.push({w:'build',f:(t,dt)=>{g.position.x+=dt*sx;if(g.position.x>180)g.position.x=-180;}});}
  // sun
  const sg=glow(0xfff2c0,260,.9);sg.position.set(-180,170,-380);sg.material.fog=false;build.add(sg);
  // trees + half-built tower on start island
  [[-8,6],[8,8],[-9,-3],[9,-2],[6,11],[-5,11]].forEach(p=>{mesh(new T.CylinderGeometry(.25,.35,1.8,6),std(0x8a5a3a),p[0],.9,p[1],build);mesh(new T.IcosahedronGeometry(1.5,0),std(0x2fbf71,{flatShading:true}),p[0],2.8,p[1],build);});
  for(let i=0;i<5;i++)mesh(new T.BoxGeometry(2.4,1.2,2.4),std(cc[i%4],{roughness:.4}),-9.2+ (i%2)*.3,.6+i*1.2,9.5,build);
  // collectible blocks
  [[-6,4],[6,5],[-4,-4],[5,-3],[0,9],[-8,0]].forEach((p,i)=>{const g=new T.Group();g.position.set(p[0],1.5,p[1]);mesh(new T.BoxGeometry(1,1,1),std(cc[i%4],{emissive:cc[i%4],emissiveIntensity:.6,roughness:.3}),0,0,0,g);g.add(glow(cc[i%4],4,.6));build.add(g);blocks.push({g:g,x:p[0],z:p[1],on:true});});
  // bridge segments (hidden until built)
  for(let i=0;i<6;i++){const z=-12.4-i*3.5;const m=mesh(new T.BoxGeometry(4.6,.7,3.4),std(cc[i%4],{roughness:.4,metalness:.1}),0,-.35,z,build);m.visible=false;m.scale.set(.01,.01,.01);segs.push({m:m,z0:z-1.8,z1:z+1.8,on:false,p:0});}
  // ghost outline of the bridge
  mesh(new T.BoxGeometry(4.6,.1,21),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.14,depthWrite:false}),0,-.1,-21.1,build,false);
  // gift
  mesh(new T.CylinderGeometry(1.3,1.7,1.2,10),std(0xf4f4f8,{flatShading:true}),0,.6,-46,build);
  gift=new T.Group();gift.position.set(0,3,-46);mesh(new T.OctahedronGeometry(1.1,0),std(0xFFC93C,{emissive:0xFFC93C,emissiveIntensity:.9,metalness:.6,roughness:.2,flatShading:true}),0,0,0,gift);gift.add(glow(0xFFC93C,10,.85));build.add(gift);
  [[-7,-40],[7,-41],[-6,-50],[6,-50]].forEach(p=>{mesh(new T.CylinderGeometry(.25,.35,1.8,6),std(0x8a5a3a),p[0],.9,p[1],build);mesh(new T.IcosahedronGeometry(1.5,0),std(0xff8ab3,{flatShading:true}),p[0],2.8,p[1],build);});
})();

