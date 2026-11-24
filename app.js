const canvas = document.querySelector('#spacefield');
const ctx = canvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointer = { x: innerWidth / 2, y: innerHeight / 2, px: innerWidth / 2, py: innerHeight / 2, vx: 0, vy: 0, active: false };
const stars = [];
let width = 0, height = 0, dpr = 1;
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2); width = innerWidth; height = innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(420, Math.max(190, Math.round(width * height / 3900)));
  stars.length = 0;
  for (let i = 0; i < count; i++) stars.push({ x: Math.random()*width, y: Math.random()*height, ox: 0, oy: 0, vx: 0, vy: 0, r: .35+Math.random()*1.05, phase: Math.random()*7, hue: Math.random() });
}
resize(); addEventListener('resize', resize);
addEventListener('pointermove', e => { pointer.px = pointer.x; pointer.py = pointer.y; pointer.x = e.clientX; pointer.y = e.clientY; pointer.vx = pointer.x-pointer.px; pointer.vy = pointer.y-pointer.py; pointer.active = true; }, {passive:true});
addEventListener('pointerleave', () => { pointer.active = false; });
const aura = document.querySelector('.pointer-aura');
const basic = document.querySelector('#basic');
const light = {x:0,y:0,tx:0,ty:0,alpha:0,ta:0};
function updateBasicLight() {
  const r = basic.getBoundingClientRect();
  const inside = pointer.active && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
  light.tx = pointer.x-r.left; light.ty = pointer.y-r.top; light.ta = inside ? 1 : 0;
  light.x += (light.tx-light.x)*.085; light.y += (light.ty-light.y)*.085; light.alpha += (light.ta-light.alpha)*.055;
  basic.style.setProperty('--light-x', `${light.x}px`); basic.style.setProperty('--light-y', `${light.y}px`); basic.style.setProperty('--light-alpha', light.alpha.toFixed(3));
}
function frame(t) {
  ctx.clearRect(0,0,width,height);
  for (const s of stars) {
    const dx=pointer.x-s.x, dy=pointer.y-s.y, d=Math.hypot(dx,dy), range=250;
    const pull=pointer.active ? Math.max(0,1-d/range) : 0;
    const spin=pull*pull*(pointer.vx*.014-pointer.vy*.014);
    if (!reduceMotion) {
      s.vx += (dx*pull*.008 - dy*spin + (Math.random()-.5)*pull*1.1) - s.vx*.075;
      s.vy += (dy*pull*.008 + dx*spin + (Math.random()-.5)*pull*1.1) - s.vy*.075;
      s.x += s.vx + Math.sin(t*.00022+s.phase)*.09;
      s.y += s.vy + Math.cos(t*.00018+s.phase)*.07;
    }
    if(s.x < -8)s.x=width+8;if(s.x>width+8)s.x=-8;if(s.y < -8)s.y=height+8;if(s.y>height+8)s.y=-8;
    const alpha=.28+.32*(.5+.5*Math.sin(t*.001+s.phase))+pull*.42;
    if(pull>.16){ctx.strokeStyle=`rgba(208,244,143,${pull*.17})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*4,s.y-s.vy*4);ctx.stroke()}
    ctx.beginPath();ctx.fillStyle=`rgba(${s.hue>.94?'224,191,129':'226,230,217'},${alpha})`;ctx.arc(s.x,s.y,s.r+pull*1.15,0,Math.PI*2);ctx.fill();
  }
  aura.style.left=pointer.x+'px';aura.style.top=pointer.y+'px';aura.style.opacity=pointer.active?'1':'0';
  updateBasicLight(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.querySelector('#back-top').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
