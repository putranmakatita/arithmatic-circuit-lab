const $=s=>document.querySelector(s);
const bin=(n,w=4)=>n.toString(2).padStart(w,'0');
const bit=(n,i)=>(n>>i)&1;
const TABS={fa:'Full adder (gates)',add:'4-bit adder',sub:'4-bit subtractor',mul:'Multiplier',div:'Divider'};
let A=11,B=6,mode='fa',fa={A:1,B:0,C:1},step=0;

/* ---------- SVG building blocks ---------- */
const W=(p,v)=>`<polyline class="w w${+!!v}" points="${p}"/>`;
const J=(x,y,v)=>`<circle class="jn j${+!!v}" cx="${x}" cy="${y}" r="4"/>`;
const T=(x,y,t,c='t')=>`<text class="${c}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
const PATH={AND:'M0 0H22A18 18 0 0 1 22 36H0Z',OR:'M0 0Q16 0 40 18Q16 36 0 36Q10 18 0 0Z',XOR:'M6 0Q22 0 46 18Q22 36 6 36Q16 18 6 0Z'};
const G=(t,x,y)=>`<g transform="translate(${x} ${y})"><path class="gate" d="${PATH[t]}"/>`+
  (t==='XOR'?'<path class="gate2" d="M0 0Q10 18 0 36"/>':'')+`<text class="gl" x="${t==='AND'?15:22}" y="22">${t}</text></g>`;
/* node: clickable when attr given; pos 'u' label above, 'd' below */
const N=(x,y,v,label,attr='',r=14,pos='u')=>`<g class="nd${attr?' act':''}" ${attr}${attr?' tabindex="0" role="button" aria-label="Toggle '+label+'"':''}>`+
  `<circle class="n n${v}" cx="${x}" cy="${y}" r="${r}"/><text class="nv" x="${x}" y="${y+5}">${v}</text>`+
  (label?T(x,pos==='u'?y-r-6:y+r+16,label):'')+`</g>`;
const Bx=(x,y,w,h,title,val)=>`<rect class="bx" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`+
  T(x+w/2,y+19,title)+T(x+w/2,y+40,val,'mono');

/* ---------- 1. Full adder at gate level ---------- */
function faView(){
  const {A:a,B:b,C:c}=fa,x=a^b,s=x^c,a1=a&b,a2=x&c,co=a1|a2;
  const o=`<svg viewBox="0 -16 640 300">`+
    W('44,50 110,50 110,69 160,69',a)+W('110,50 110,149 160,149',a)+J(110,50,a)+
    W('44,100 130,100 130,87 160,87',b)+W('130,100 130,167 160,167',b)+J(130,100,b)+
    W('206,78 300,78',x)+W('240,78 240,209 300,209',x)+J(240,78,x)+
    W('44,240 250,240 250,96 300,96',c)+W('250,227 300,227',c)+J(250,227,c)+
    W('200,158 440,158',a1)+W('340,218 400,218 400,176 440,176',a2)+
    W('346,87 570,87',s)+W('480,167 570,167',co)+
    G('XOR',160,60)+G('AND',160,140)+G('XOR',300,69)+G('AND',300,200)+G('OR',440,149)+
    N(30,50,a,'A','data-f="A"')+N(30,100,b,'B','data-f="B"')+N(30,240,c,'Cin','data-f="C"')+
    N(584,87,s,'Sum','',14,'d')+N(584,167,co,'Cout','',14,'d')+T(223,70,'x = A⊕B','gl')+`</svg>`;
  return `<div class="dg">${o}</div><div class="res">${a}+${b}+${c} = ${co}${s} (binary) = ${a+b+c}</div>
  <p class="note">Sum = A ⊕ B ⊕ Cin. Cout = A·B + Cin·(A ⊕ B). Click A, B or Cin to flip them.</p>`;
}

/* ---------- 2/3. 4-bit ripple adder / subtractor ---------- */
function rippleView(sub){
  let c=sub?1:0,S=0,L=[];
  for(let i=0;i<4;i++){const a=bit(A,i),b0=bit(B,i),b=b0^+sub,x=a^b,s=x^c,co=(a&b)|(c&x);L.push({i,a,b0,b,c,s,co});S|=s<<i;c=co;}
  let o=`<svg viewBox="0 -16 780 346">`;
  for(const r of L){
    const bx=60+(3-r.i)*170;
    o+=W(`${bx+30},39 ${bx+30},130`,r.a);
    o+=sub?W(`${bx+90},39 ${bx+90},60`,r.b0)+`<rect class="bx" x="${bx+68}" y="60" width="44" height="26" rx="4"/>`+T(bx+90,78,'XOR 1')+W(`${bx+90},86 ${bx+90},130`,r.b)
          :W(`${bx+90},39 ${bx+90},130`,r.b);
    o+=`<rect class="bx big" x="${bx}" y="130" width="120" height="90" rx="8"/>`+T(bx+60,170,'Full adder','bt2')+T(bx+60,192,'bit '+r.i);
    o+=W(`${bx+60},220 ${bx+60},268`,r.s)+W(`${bx},175 ${r.i===3?34:bx-50},175`,r.co);
    o+=N(bx+30,25,r.a,'A'+r.i,`data-k="A" data-i="${r.i}"`)+N(bx+90,25,r.b0,'B'+r.i,`data-k="B" data-i="${r.i}"`)+N(bx+60,282,r.s,'S'+r.i,'',14,'d');
    if(r.i===0)o+=W(`${bx+120},175 730,175`,r.c)+N(744,175,r.c,'Cin','',14,'d');
  }
  o+=N(20,175,c,'Cout','',14,'d')+`</svg>`;
  const res=sub?`${A} − ${B} = ${A-B}`:`${A} + ${B} = ${S+(c<<4)}`;
  const note=sub?`Computed as A + NOT B + 1. Final carry ${c}: ${c?'no borrow, result ≥ 0.':'borrow occurred, 4-bit result '+bin(S)+' is the two\'s complement of a negative number.'}`
    :`Carry ripples right to left. Result bits S3..S0 = ${bin(S)}, Cout = ${c}.`;
  return `<div class="dg">${o}</div><div class="res">${res}</div><p class="note">${note}</p>`;
}

/* ---------- 4. 4x4 array multiplier ---------- */
function multView(){
  let o=`<svg viewBox="0 -16 520 496">`,tot=0;
  for(let j=0;j<4;j++)tot+=(bit(B,j)?A:0)<<j;
  for(let i=0;i<4;i++){const gx=90+(3-i)*115;o+=W(`${gx-14},39 ${gx-14},294`,bit(A,i));}
  for(let j=0;j<4;j++){
    const gy=60+j*75,b=bit(B,j);
    o+=W(`34,${gy+46} 429,${gy+46}`,b);
    for(let i=0;i<4;i++){
      const gx=90+(3-i)*115,a=bit(A,i),p=a&b;
      o+=W(`${gx-14},${gy+9} ${gx},${gy+9}`,a)+J(gx-14,gy+9,a)+W(`${gx-6},${gy+46} ${gx-6},${gy+27} ${gx},${gy+27}`,b)+J(gx-6,gy+46,b)+
         W(`${gx+40},${gy+18} ${gx+49},${gy+18}`,p)+G('AND',gx,gy)+N(gx+58,gy+18,p,'','',9);
    }
    o+=N(20,gy+46,b,'B'+j,`data-k="B" data-i="${j}"`);
  }
  for(let i=0;i<4;i++)o+=N(90+(3-i)*115-14,25,bit(A,i),'A'+i,`data-k="A" data-i="${i}"`);
  o+=`<rect class="bx big" x="20" y="350" width="480" height="44" rx="8"/>`+T(260,377,'Adder array: full adders sum the shifted partial products');
  for(let k=7;k>=0;k--){const x=40+(7-k)*62;o+=W(`${x},394 ${x},426`,bit(tot,k))+N(x,440,bit(tot,k),'P'+k,'',14,'d');}
  return `<div class="dg">${o}</svg></div><div class="res">${A} × ${B} = ${tot}</div>
  <p class="note">Each AND gate makes one partial product bit (Ai · Bj). Row j is shifted left by j places before the adder array adds the rows.</p>`;
}

/* ---------- 5. Restoring divider (sequential, one clock per step) ---------- */
function dsteps(){let R=0,Q=0,s=[];for(let i=3;i>=0;i--){const sh=(R<<1)|bit(A,i),d=sh-B,ok=d>=0;if(ok){R=d;Q|=1<<i}else R=sh;s.push({i,sh,d,ok,R,Q});}return s;}
function divView(){
  if(B===0)return `<p class="warn">Division by zero is undefined. Set B to 1 or more.</p>`;
  const S=dsteps(),st=step?S[step-1]:null,on=step>0;
  const R=st?st.R:0,Q=st?st.Q:0,ok=st&&st.ok;
  const o=`<svg viewBox="0 -16 720 316">`+
    W('140,145 200,145',on)+W('270,70 270,120',on)+W('450,70 450,120',on)+W('340,145 390,145',on)+
    W('520,145 560,145',ok)+W('270,170 270,205 620,205 620,170',on&&!ok)+W('620,120 620,95 80,95 80,120',on)+W('455,170 455,250 560,250',ok)+
    Bx(200,20,140,50,'Dividend A',bin(A))+Bx(390,20,120,50,'Divisor B',bin(B))+Bx(20,120,120,50,'Remainder R',bin(step?S[step-2]?S[step-2].R:0:0))+
    Bx(200,120,140,50,'Shift left + A bit '+(st?st.i:'–'),st?bin(st.sh,5):'-----')+Bx(390,120,130,50,'Subtract B',st?String(st.d):'-')+
    Bx(560,120,120,50,'Keep',st?(ok?'R − B':'restore'):'-')+Bx(560,225,120,50,'Quotient Q',bin(Q))+T(462,196,'sign → q bit','gl')+`</svg>`;
  const info=st?`Step ${step}: shifted value ${st.sh}, minus ${B} = ${st.d}. ${ok?'Not negative, so keep the difference and set q'+st.i+' = 1.':'Negative, so restore and set q'+st.i+' = 0.'} Remainder is now ${R}.`:'Press Step to clock the circuit once.';
  return `<div class="ctl"><button data-d="step">Step</button><button data-d="run">Run all</button><button data-d="reset">Reset</button></div>
  <div class="dg">${o}</div><div class="res">${step===4?`${A} ÷ ${B} = ${Q} remainder ${R}`:'Clock '+step+' of 4'}</div><p class="note">${info}</p>`;
}

/* ---------- page shell ---------- */
function inputs(){
  if(mode==='fa'){$('#inputs').innerHTML='';return;}
  const box=(n,v)=>`<div class="inp"><label>${n}</label><div class="row">`+[3,2,1,0].map(i=>
    `<button class="bt ${bit(v,i)?'on':''}" data-k="${n}" data-i="${i}" aria-pressed="${!!bit(v,i)}" aria-label="${n} bit ${i}">${bit(v,i)}</button>`).join('')+
    `<input type="number" min="0" max="15" value="${v}" data-n="${n}" aria-label="${n} decimal"></div></div>`;
  $('#inputs').innerHTML=box('A',A)+box('B',B);
}
function render(){
  $('#tabs').innerHTML=Object.entries(TABS).map(([k,v])=>`<button role="tab" data-m="${k}" aria-selected="${k===mode}">${v}</button>`).join('');
  $('#out').innerHTML={fa:faView,add:()=>rippleView(false),sub:()=>rippleView(true),mul:multView,div:divView}[mode]();
}
function all(){inputs();render();}

function activate(t){
  if(t.dataset.m){mode=t.dataset.m;step=0;all();}
  else if(t.dataset.f){fa[t.dataset.f]^=1;render();}
  else if(t.dataset.k){const i=+t.dataset.i;if(t.dataset.k==='A')A^=1<<i;else B^=1<<i;step=0;all();}
  else if(t.dataset.d){const d=t.dataset.d;if(d==='step'&&step<4)step++;if(d==='run')step=4;if(d==='reset')step=0;render();}
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-m],[data-f],[data-k],[data-d]');if(t)activate(t);});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest('g[data-f],g[data-k]');if(t){e.preventDefault();activate(t);}});
document.addEventListener('change',e=>{const k=e.target.dataset.n;if(!k)return;
  const v=Math.max(0,Math.min(15,parseInt(e.target.value)||0));if(k==='A')A=v;else B=v;step=0;all();});
all();
