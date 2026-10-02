// ใส่ลิงก์ของคุณตรงนี้ (ดูขั้นตอนใน README)
const CONFIG={APPS_SCRIPT_URL:'PASTE_APPS_SCRIPT_URL_HERE',CSV_URL:'https://script.google.com/macros/s/AKfycbwNjKDqDqOBtPNhyhGfga4Un4LXv3SeqNekEUFEUkMhKIO3oddsPZyaUqV6CIcGGE-B/exec'};
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=p=>`<article class="pcard reveal"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"><div class="pbody"><span class="tag">${esc(p.heat)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="prow"><b>${p.price} บาท</b><a class="btn sm" href="order.html?item=${encodeURIComponent(p.name)}&price=${p.price}">สั่งซื้อ</a></div></div></article>`;
function observe(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el))}
async function products(){return (await fetch('products.json')).json()}
async function init(){
 const list=$('#product-list'),home=$('#home-products');
 if(list||home){const ps=await products();
  if(home)home.innerHTML=ps.map(card).join('');
  if(list){const bar=$('#filter-bar'),heats=['ทั้งหมด',...new Set(ps.map(p=>p.heat))];
   const show=h=>{list.innerHTML=ps.filter(p=>h==='ทั้งหมด'||p.heat===h).map(card).join('');bar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.h===h));observe()};
   bar.innerHTML=heats.map(h=>`<button data-h="${h}">${h}</button>`).join('');
   bar.onclick=e=>{if(e.target.dataset.h)show(e.target.dataset.h)};
   const q=new URLSearchParams(location.search).get('heat');show(heats.includes(q)?q:'ทั้งหมด')}}
 const form=$('#orderForm');
 if(form){const q=new URLSearchParams(location.search);
  if(q.get('item'))$('#items').value=q.get('item');if(q.get('price'))$('#total').value=q.get('price');
  form.onsubmit=e=>{e.preventDefault();
   const payload={customerName:$('#customerName').value,contact:$('#contact').value,items:$('#items').value,total:$('#total').value,note:$('#note').value};
   fetch(CONFIG.APPS_SCRIPT_URL,{method:'POST',body:JSON.stringify(payload)})
   .then(()=>{window.location.href='thankyou.html'})
   .catch(err=>{console.error(err);alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')})}}
 const tb=$('#ordersTable tbody');
 if(tb){try{const rows=parseCSV(await (await fetch(CONFIG.CSV_URL)).text()).slice(1).reverse();
  tb.innerHTML=rows.map(r=>`<tr>${r.slice(0,6).map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="6">ยังไม่มีออเดอร์</td></tr>'}
  catch(err){tb.innerHTML='<tr><td colspan="6">โหลดข้อมูลไม่สำเร็จ ตรวจ CSV_URL ใน script.js</td></tr>'}}
 observe()}
function parseCSV(t){const rows=[];let r=[],c='',q=false;
 for(let i=0;i<t.length;i++){const ch=t[i];
  if(q){if(ch==='"'&&t[i+1]==='"'){c+='"';i++}else if(ch==='"')q=false;else c+=ch}
  else if(ch==='"')q=true;else if(ch===','){r.push(c);c=''}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;r.push(c);rows.push(r);r=[];c=''}else c+=ch}
 if(c||r.length){r.push(c);rows.push(r)}return rows.filter(x=>x.some(v=>v!==''))}
init();
