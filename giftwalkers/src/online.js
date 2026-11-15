/* ---------- ONLINE: rooms with a code (Firebase Realtime Database) ---------- */
// The Firebase web config is a public identifier, not a secret. Access is limited by the database rules.
const FB_CFG={apiKey:"AIzaSyDUbJ-N7gd2KE6qks8LFijYRN5DpBp59sI",authDomain:"giftwalkers.firebaseapp.com",databaseURL:"https://giftwalkers-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"giftwalkers",storageBucket:"giftwalkers.firebasestorage.app",messagingSenderId:"286160960989",appId:"1:286160960989:web:8f53be4f1a42acf8858a34"};
const FB_V='10.12.2';
const NET={ready:false,loading:null,uid:null,room:null,ref:null,me:null,peers:{},last:0,sent:'',pending:null};
window.__NET=NET;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);});}
function netInit(){
  if(NET.ready)return Promise.resolve();
  if(NET.loading)return NET.loading;
  const base='https://www.gstatic.com/firebasejs/'+FB_V+'/';
  NET.loading=loadScript(base+'firebase-app-compat.js').then(()=>loadScript(base+'firebase-auth-compat.js')).then(()=>loadScript(base+'firebase-database-compat.js'))
    .then(()=>{if(!firebase.apps.length)firebase.initializeApp(FB_CFG);return firebase.auth().signInAnonymously();})
    .then(c=>{NET.uid=c.user.uid;NET.ready=true;})
    .catch(e=>{NET.loading=null;throw new Error('load');});
  return NET.loading;
}
function roomCode(){const L='ABCDEFGHJKMNPQRSTUVWXYZ';let c='';for(let i=0;i<3;i++)c+=L[Math.floor(Math.random()*L.length)];for(let i=0;i<3;i++)c+=Math.floor(Math.random()*10);return c;}
function fmtCode(c){return c.slice(0,3)+'-'+c.slice(3);}
function parseCode(s){const m=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').match(/^([A-Z]{3})(\d{3})$/);return m?m[1]+m[2]:null;}
function inWorldState(){return G.state==='town'||G.state==='build'||G.state==='market'||G.state==='win';}
function myState(){return {n:(cfg.name||'Player').slice(0,14),c:[cfg.base==='kai'?1:0,cfg.skin,cfg.hair,cfg.hairC,cfg.head,cfg.top,cfg.pants,cfg.shoes,cfg.acc],w:inWorldState()?G.world:'-',x:Math.round(P.x*100)/100,y:Math.round(P.y*100)/100,z:Math.round(P.z*100)/100,f:Math.round(P.face*100)/100};}
function netJoin(code,create){
  return netInit().then(()=>{
    const ref=firebase.database().ref('rooms/'+code+'/players');
    return ref.once('value').then(snap=>{
      const n=snap.numChildren();
      if(!create&&n===0)throw new Error('notfound');
      if(create&&n>0)throw new Error('taken');
      if(n>=8&&!snap.hasChild(NET.uid))throw new Error('full');
      netLeave();
      NET.room=code;NET.ref=ref;NET.me=ref.child(NET.uid);
      NET.me.onDisconnect().remove();
      NET.sent='';netSend(true);
      ref.on('child_added',netPeer);ref.on('child_changed',netPeer);ref.on('child_removed',s=>netDrop(s.key));
      netBadge();
    });
  });
}
function netLeave(){
  if(!NET.ref)return;
  try{NET.ref.off();NET.me.onDisconnect().cancel();NET.me.remove();}catch(e){}
  Object.keys(NET.peers).forEach(netDrop);NET.room=null;NET.ref=null;NET.me=null;netBadge();
}
function netSend(force){if(!NET.me)return;const s=myState(),j=JSON.stringify(s);if(!force&&j===NET.sent)return;NET.sent=j;try{NET.me.set(s).catch(()=>{});}catch(e){}}
function num(v,d){return typeof v==='number'&&isFinite(v)?Math.max(-500,Math.min(500,v)):d;}
function netPeer(snap){
  const id=snap.key;if(id===NET.uid)return;const v=snap.val();if(!v||typeof v!=='object')return;
  let name=cleanName(typeof v.n==='string'?v.n:'').trim()||'Player';if(badName(name))name='Player';
  const a=Array.isArray(v.c)?v.c:[],lim=[2,SKIN.length,5,HAIRC.length,4,TOPC.length,PANTC.length,SHOEC.length,4];
  const c=lim.map((m,i)=>{const k=parseInt(a[i],10);return k>=0&&k<m?k:0;});
  const key=name+'|'+c.join(',');
  let p=NET.peers[id];
  if(!p)p=NET.peers[id]={g:null,key:'',x:0,y:0,z:0,f:0,tx:0,ty:0,tz:0,tf:0,w:'',walk:0,fresh:true,name:name};
  if(p.key!==key){if(p.g)scene.remove(p.g);p.g=makeChar({base:c[0]?'kai':'nova',skin:c[1],hair:c[2],hairC:c[3],head:c[4],top:c[5],pants:c[6],shoes:c[7],acc:c[8],name:name});p.g.visible=false;scene.add(p.g);p.key=key;p.name=name;}
  p.w=typeof v.w==='string'?v.w:'';p.tx=num(v.x,0);p.ty=num(v.y,0);p.tz=num(v.z,0);p.tf=num(v.f,0);
  if(p.fresh){p.x=p.tx;p.y=p.ty;p.z=p.tz;p.f=p.tf;p.fresh=false;toast(name+' joined the room');sfx('spark',3);}
  netBadge();
}
NET.peerFn=netPeer;
function netDrop(id){const p=NET.peers[id];if(!p)return;if(p.g)scene.remove(p.g);delete NET.peers[id];netBadge();}
function netBadge(){
  const n=Object.keys(NET.peers).length+1,b=$('roomBadge');
  b.style.display=NET.room?'block':'none';
  if(NET.room)b.textContent='Room '+fmtCode(NET.room)+' · '+n+(n>1?' players':' player');
  mpDraw();
}
function netUpdate(t,dt){
  if(NET.me&&t-NET.last>.14){NET.last=t;netSend(false);}
  const inW=inWorldState();
  for(const id in NET.peers){
    const p=NET.peers[id];if(!p.g)continue;
    const show=inW&&p.w===G.world;p.g.visible=show;if(!show)continue;
    const k=Math.min(1,dt*10),ox=p.x,oz=p.z;
    if(Math.hypot(p.tx-p.x,p.tz-p.z)>12){p.x=p.tx;p.z=p.tz;p.y=p.ty;}
    p.x+=(p.tx-p.x)*k;p.y+=(p.ty-p.y)*k;p.z+=(p.tz-p.z)*k;
    let d=p.tf-p.f;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;p.f+=d*k;
    const sp=Math.hypot(p.x-ox,p.z-oz)/Math.max(dt,.001);
    if(sp>.6)p.walk+=dt*11;
    const sw=sp>.6?Math.sin(p.walk)*.9:0,L=p.g.userData.legs,A=p.g.userData.arms;
    L[0].rotation.x=sw;L[1].rotation.x=-sw;A[0].rotation.x=-sw*.8;A[1].rotation.x=sw*.8;
    p.g.position.set(p.x,p.y,p.z);p.g.rotation.y=p.f;
  }
}
/* friends panel */
function mpMsg(s,ok){const e=$('mpMsg');e.textContent=s||'';e.style.color=ok?'#19E3C2':'#FF8FB3';}
function mpDraw(){
  const inRoom=!!NET.room;
  $('mpOut').style.display=inRoom?'none':'block';$('mpIn').style.display=inRoom?'block':'none';
  if(inRoom){$('mpCode').textContent=fmtCode(NET.room);const names=[(cfg.name||'You')+' (you)'].concat(Object.keys(NET.peers).map(k=>NET.peers[k].name));$('mpWho').textContent=names.join(' · ');}
}
function mpErr(e){
  const m=e&&e.message;
  mpMsg(m==='notfound'?'Room not found. Check the code.':m==='full'?'This room is full (8 players).':m==='taken'?'Please try again.':'Could not connect. Online play needs the public game link and an internet connection.');
}
function openMp(){G.help=true;pads(false);$('mp').style.display='flex';mpMsg('');mpDraw();if(NET.pending){$('mpInput').value=fmtCode(NET.pending);}}
function closeMp(){G.help=false;$('mp').style.display='none';if((G.state==='town'||G.state==='build'||G.state==='market')&&!G.busy)pads(true);}
function mpAfterJoin(){mpMsg('You are in. Share the code with your friends.',true);NET.pending=null;try{if(location.hash.indexOf('#room-')===0)history.replaceState(null,'',location.pathname);}catch(e){}}
function mpCreate(){mpMsg('Creating a room...',true);netJoin(roomCode(),true).then(mpAfterJoin).catch(e=>{if(e&&e.message==='taken')return netJoin(roomCode(),true).then(mpAfterJoin);throw e;}).catch(mpErr);}
function mpJoinClick(){const c=parseCode($('mpInput').value);if(!c){mpMsg('A room code looks like ABC-123.');return;}mpMsg('Joining...',true);netJoin(c,false).then(mpAfterJoin).catch(mpErr);}
function mpShare(){
  const url=location.origin+location.pathname+'#room-'+NET.room,text='Join my Giftwalkers room: '+fmtCode(NET.room);
  const copy=()=>{try{navigator.clipboard.writeText(text+'  '+url).then(()=>mpMsg('Invite copied. Paste it to your friends.',true),()=>mpMsg('Room code: '+fmtCode(NET.room),true));}catch(e){mpMsg('Room code: '+fmtCode(NET.room),true);}};
  try{if(navigator.share){navigator.share({title:'Giftwalkers',text:text,url:url}).catch(copy);return;}}catch(e){}
  copy();
}
try{const m=location.hash.match(/^#room-([A-Za-z]{3}\d{3})$/);if(m)NET.pending=m[1].toUpperCase();}catch(e){}

