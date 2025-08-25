  // -------------------- Durum --------------------
  let ibans = [];
  let editingId = null;

const bankDB = {
  // Kamu Bankaları
  '0010': {name: 'Ziraat Bankası', logo: 'banka-logo/ziraat.png'},
  '0012': {name: 'Halkbank', logo: 'banka-logo/halkbank.png'},
  '0015': {name: 'VakıfBank', logo: 'banka-logo/vakifbank.png'},
  
  // Özel Bankalar
  '0062': {name: 'Garanti BBVA', logo: 'banka-logo/garanti.png'},
  '0064': {name: 'İş Bankası', logo: 'banka-logo/isbank.png'},
  '0046': {name: 'Akbank', logo: 'banka-logo/akbank.png'},
  '0067': {name: 'Yapı Kredi', logo: 'banka-logo/yapikredi.png'},
  '0111': {name: 'QNB Finansbank', logo: 'banka-logo/qnb.png'},
  '0134': {name: 'Denizbank', logo: 'banka-logo/denizbank.png'},
  '0032': {name: 'TEB', logo: 'banka-logo/teb.png'},
  '0099': {name: 'ING Bank', logo: 'banka-logo/ing.png'},
  '0123': {name: 'HSBC', logo: 'banka-logo/hsbc.png'},
  '0059': {name: 'Şekerbank', logo: 'banka-logo/sekerbank.png'},

  // Katılım Bankaları
  '0206': {name: 'Türkiye Finans', logo: 'banka-logo/ziraat.png'},
  '0203': {name: 'Albaraka Türk', logo: 'banka-logo/albarak.png'},
  '0205': {name: 'Kuveyt Türk', logo: 'banka-logo/kuveytturk.png'},
  '0210': {name: 'Vakıf Katılım', logo: 'banka-logo/vakifkatilim.png'},
  '0211': {name: 'Ziraat Katılım', logo: 'banka-logo/ziraatkatilim.png'},
  '0214': {name: 'Türkiye Emlak Katılım', logo: 'banka-logo/emlakkatilim.png'}
};

  // -------------------- Yardımcılar --------------------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const saveStore = () => localStorage.setItem('ibans', JSON.stringify(ibans));
  const loadStore = () => JSON.parse(localStorage.getItem('ibans')||'[]');

  const toast = (msg, type='ok')=>{
    const w = $('#toasts');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${type==='ok'?'fa-check-circle':type==='err'?'fa-circle-exclamation':'fa-triangle-exclamation'}"></i><span>${msg}</span>`;
    w.appendChild(t);
    setTimeout(()=>{ t.remove() }, 2600);
  }

  const fmtGroups = s => s.replace(/\s+/g,'').replace(/(.{4})/g,'$1 ').trim();

 // TR IBAN doğrulama (MOD97)
function isValidTR(iban){
  const clean = iban.replace(/\s+/g,'').toUpperCase();
  if(!/^TR\d{24}$/.test(clean)) return false;
  const r = clean.slice(4) + clean.slice(0,4);
  const num = r.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
  let rem = 0; 
  let i = 0;
  while(i < num.length){
    const block = String(rem) + num.slice(i, i + 7);
    rem = parseInt(block, 10) % 97; 
    i += 7;
  }
  return rem === 1;
}

 function detectBank(iban){
  const clean = iban.replace(/\s+/g,'').toUpperCase();
  // Geçersiz/eksikse erken çık
  if (!/^TR\d{0,24}$/.test(clean) || clean.length < 8) {
    return { code: '', name: 'Bilinmeyen Banka', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWQ9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIgMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNSIgZmlsbD0iIzc yNzY3ZCIvPjxwYXRoIGQ9Ik05IDEyaDVIMjR2NUgxNHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+' };
  }
  // TR + 2 kontrol hanesi => banka kodu 4..8 arası (4 hane)
  const code = clean.slice(5, 9);        // <— DÜZELTME: 2..6 yerine 4..8
  const b = bankDB[code];
  return {
    code,
    name: b ? b.name : 'Bilinmeyen Banka',
    logo: b ? b.logo : 'data:image/svg+xml;base64,PHN2ZyB3aWQ9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIgMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNSIgZmlsbD0iIzc yNzY3ZCIvPjxwYXRoIGQ9Ik05IDEyaDVIMjR2NUgxNHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
  };
}


  // -------------------- Uygulama --------------------
  document.addEventListener('DOMContentLoaded', init);

  function init(){
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){ document.body.dataset.theme = savedTheme; $('#themeBtn i').className = savedTheme==='dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; }

    ibans = loadStore();

    // UI events
    $('#themeBtn').addEventListener('click', toggleTheme);
    $('#exportBtn').addEventListener('click', exportData);
    $('#importBtn').addEventListener('click', ()=> $('#importFile').click());
    $('#importFile').addEventListener('change', importData);

    $('#addBtn').addEventListener('click', openAdd);
    $('#addBtnEmpty').addEventListener('click', openAdd);
    $('#fab').addEventListener('click', openAdd);

    $('#filters-toggle').addEventListener('click', ()=>{
      if (window.matchMedia('(max-width:768px)').matches){
        $('#filters-body').classList.toggle('is-collapsed');
        const open = !$('#filters-body').classList.contains('is-collapsed');
        $('#filters-caret').style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
      }
    });

    $('#q').addEventListener('input', debounce(render, 250));
    $('#flt').addEventListener('change', render);
    $('#sort').addEventListener('change', render);

    document.addEventListener('keydown', (e)=>{
      if(e.ctrlKey && e.key.toLowerCase()==='n'){ e.preventDefault(); openAdd(); }
      if(e.key==='Escape'){ closeModal(); closeQr(); }
    });

    // Form
    $('#mclose').addEventListener('click', closeModal);
    $('#cancel').addEventListener('click', closeModal);
    $('#qclose').addEventListener('click', closeQr);
    $('#qrModal').addEventListener('click', (e)=>{ if(e.target.id==='qrModal') closeQr(); });

    $('#form').addEventListener('submit', onSave);
    $('#name').addEventListener('input', validateForm);
    $('#iban').addEventListener('input', onIbanInput);
    // tags input dinamiği aşağıda openAdd/openEdit içinde bağlanıyor

    // Başlangıç görünümü
    if (window.matchMedia('(max-width:768px)').matches){
      $('#filters-body').classList.add('is-collapsed');
    }

    render();
  }

  function toggleTheme(){
    const isDark = document.body.dataset.theme !== 'light';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    $('#themeBtn i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', document.body.dataset.theme);
  }

  // ---- Form Yardımcıları ----
  function onIbanInput(){
    const el = $('#iban');
    let v = el.value.toUpperCase();
    v = v.replace(/[^A-Z0-9]/g,'');
    el.value = fmtGroups(v);

    const clean = v;
    const ok = clean.length>0 && isValidTR(clean);
    $('#ival').innerHTML = ok
      ? '<i class="fa-solid fa-check-circle ok"></i><span>Geçerli IBAN</span>'
      : (clean.length? '<i class="fa-solid fa-circle-exclamation bad"></i><span>Geçersiz IBAN</span>' : '<i class="fa-solid fa-info-circle"></i><span>IBAN giriniz</span>');

    const bp = detectBank(clean || 'TR0000');
    $('#bname').textContent = bp.name;
    $('#bcode').textContent = `Banka Kodu: ${bp.code||'—'}`;
    $('#bimg').src = bp.logo;
    $('#bprev').classList.toggle('show', clean.length>=8);

    validateForm();
  }

  function onTagKey(e){
    if(e.key==='Enter' && e.target.value.trim()){
      e.preventDefault();
      addTag(e.target.value.trim());
      e.target.value='';
    }
  }

  function addTag(txt){
    const holder = $('#tags');
    const exists = $$('.titem', holder).some(x=>x.firstChild.nodeValue.trim().toLowerCase()===txt.toLowerCase());
    if(exists) return;
    const el = document.createElement('span');
    el.className='titem';
    el.innerHTML = `${txt} <button class="tx" title="Kaldır">×</button>`;
    el.querySelector('button').addEventListener('click', ()=> el.remove());
    holder.insertBefore(el, $('#tinput'));
  }

  function getTags(){ return $$('.titem').map(el=> el.firstChild.nodeValue.trim()); }

  function validateForm(){
    const ok = $('#name').value.trim().length>0 && isValidTR($('#iban').value.replace(/\s+/g,''));
    $('#save').disabled = !ok;
  }

  function openAdd(){
    editingId = null;
    $('#mtitle').textContent = 'Yeni IBAN Ekle';
    $('#form').reset();
    $('#ival').innerHTML = '<i class="fa-solid fa-info-circle"></i><span>IBAN giriniz</span>';
    $('#bprev').classList.remove('show');
    $('#tags').innerHTML = '<input id="tinput" class="tinput" placeholder="Etiket ekle… (Enter)" />';
    $('#tinput').addEventListener('keydown', onTagKey);
    $('#save').disabled = true;
    $('#modal').classList.add('is-open');
    setTimeout(()=> $('#name').focus(), 50);
  }

  function openEdit(id){
    const it = ibans.find(x=>x.id===id); if(!it) return;
    editingId = id;
    $('#mtitle').textContent = 'IBAN Düzenle';
    $('#name').value = it.name;
    $('#iban').value = it.number;
    $('#desc').value = it.description||'';
    $('#tags').innerHTML = '<input id="tinput" class="tinput" placeholder="Etiket ekle… (Enter)" />';
    $('#tinput').addEventListener('keydown', onTagKey);
    (it.tags||[]).forEach(addTag);
    onIbanInput();
    $('#modal').classList.add('is-open');
  }

  function closeModal(){ $('#modal').classList.remove('is-open'); }

  function onSave(e){
    e.preventDefault();
    const name = $('#name').value.trim();
    const number = $('#iban').value.replace(/\s+/g,'');
    const description = $('#desc').value.trim();
    const tags = getTags();

    const bank = detectBank(number);
    const exists = ibans.find(x=>x.id===editingId);

    const obj = {
      id: editingId || String(Date.now()),
      name,
      number: fmtGroups(number),
      description,
      tags,
      bank: { name: bank.name, logo: bank.logo },
      favorite: exists? !!exists.favorite : false,
      hidden: exists? !!exists.hidden : false,
      usageCount: exists? (exists.usageCount||0) : 0,
      lastUsed: exists? (exists.lastUsed||null) : null,
      createdAt: exists? exists.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if(exists){
      const i = ibans.findIndex(x=>x.id===editingId); ibans[i]=obj; toast('IBAN güncellendi','ok');
    } else {
      ibans.push(obj); toast('IBAN eklendi','ok');
    }

    saveStore();
    render();
    closeModal();
  }

  function delIban(id){
    if(!confirm('Bu IBAN\'ı silmek istediğinizden emin misiniz?')) return;
    ibans = ibans.filter(x=>x.id!==id); saveStore(); render(); toast('IBAN silindi','ok');
  }

  function favIban(id){ const it = ibans.find(x=>x.id===id); if(!it) return; it.favorite=!it.favorite; saveStore(); render(); toast(it.favorite?'Favorilere eklendi':'Favorilerden çıkarıldı','ok'); }
  function hideIban(id){ const it=ibans.find(x=>x.id===id); if(!it) return; it.hidden=!it.hidden; saveStore(); render(); }

  function copyIban(id){
    const it = ibans.find(x=>x.id===id); if(!it) return;
    const clean = it.number.replace(/\s+/g,'');
    navigator.clipboard.writeText(clean).then(()=>{
      it.usageCount = (it.usageCount||0)+1; it.lastUsed = new Date().toISOString(); saveStore(); updateStats();
      const card = document.querySelector(`[data-id="${id}"] .copied`); if(card){ card.classList.add('show'); setTimeout(()=> card.classList.remove('show'), 1500); }
      toast('IBAN kopyalandı','ok');
    });
  }

  // ---- Liste / Arama / Sıralama ----
  function applyFilters(list){
    const q = $('#q').value.trim().toLowerCase();
    const f = $('#flt').value; const s = $('#sort').value;

    let out = list;
    if(q){ out = out.filter(i => i.name.toLowerCase().includes(q) || i.number.replace(/\s+/g,'').includes(q.replace(/\s+/g,'')) || i.bank.name.toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q) || (i.tags||[]).some(t=>t.toLowerCase().includes(q)) ); }
    if(f==='fav') out = out.filter(i=>i.favorite);
    if(f==='recent') out = out.filter(i=> i.lastUsed);

    out.sort((a,b)=>{
      switch(s){
        case 'name': return a.name.localeCompare(b.name,'tr');
        case 'bank': return a.bank.name.localeCompare(b.bank.name,'tr');
        case 'date': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'usage': return (b.usageCount||0) - (a.usageCount||0);
        default: return 0;
      }
    });
    return out;
  }

  function render(){
    const list = applyFilters(ibans);
    const wrap = $('#cards');
    wrap.innerHTML = list.map(tplCard).join('');

    $('#empty').hidden = ibans.length>0;
    wrap.style.display = ibans.length? 'grid' : 'none';

    updateStats();
  }

  function tplCard(it){
    const last = it.lastUsed ? `Son kullanım: ${new Date(it.lastUsed).toLocaleDateString('tr-TR')}` : 'Hiç kullanılmadı';
    return `
      <div class="card" data-id="${it.id}">
        <div class="card-h">
          <div class="bank">
            <div class="logo"><img src="${it.bank.logo}" alt="${it.bank.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHJ4PSI4IiBmaWxsPSIjMjIyIi8+PHBhdGggZD0iTTE0IDE2aDExdjEwSDE0VjE2WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4='"/></div>
            <div class="t"><h4>${it.name}</h4><div class="s">${it.bank.name}</div></div>
          </div>
          <div class="ca">
            <button class="a ${it.favorite?'is-active':''}" title="Favorile" onclick="favIban('${it.id}')"><i class="fa-solid fa-star"></i></button>
            <button class="a" title="${it.hidden?'Göster':'Gizle'}" onclick="hideIban('${it.id}')"><i class="fa-solid fa-eye${it.hidden?'-slash':''}"></i></button>
            <button class="a" title="QR Göster" onclick="openQr('${it.id}')"><i class="fa-solid fa-qrcode"></i></button>
            <button class="a" title="Düzenle" onclick="openEdit('${it.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="a" title="Sil" onclick="delIban('${it.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div class="iban ${it.hidden?'is-hidden':''}" onclick="copyIban('${it.id}')">
          <div class="v">${it.number}</div>
          <div class="copied">Kopyalandı!</div>
        </div>
        ${it.tags && it.tags.length? `<div class="tags">${it.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
        ${it.description? `<div class="desc">${it.description}</div>`:''}
        <div class="foot">
          <div><div>${last}</div><div>Kullanım: ${it.usageCount||0}</div></div>
        </div>
      </div>`
  }

  // ---- QR Modal ----
  function openQr(id){
    const it = ibans.find(x=>x.id===id); if(!it) return;
    const clean = it.number.replace(/\s+/g,'');
    const modal = $('#qrModal');
    const qrBig = $('#qrBig');
    qrBig.innerHTML = '';
    if(window.QRCode){ new QRCode(qrBig, { text: clean, width:240, height:240, correctLevel: QRCode.CorrectLevel.M }); }
    else { qrBig.textContent = 'QR üretilemedi'; }
    modal.classList.add('is-open');
  }
  function closeQr(){ $('#qrModal').classList.remove('is-open'); }

  // ---- Dışa/İçe Aktarım ----
  function exportData(){
    const blob = new Blob([JSON.stringify(ibans,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `benimIbanlari-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast('Veriler dışa aktarıldı','ok');
  }

  function importData(e){
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => {
      try{
        const arr = JSON.parse(r.result);
        if(Array.isArray(arr)){
          if(confirm(`${arr.length} IBAN içe aktarılacak. Devam edilsin mi?`)){
            const ids = new Set(ibans.map(x=>x.id));
            arr.forEach(x=>{ if(!x.id || ids.has(x.id)) x.id = String(Date.now()+Math.random()); ibans.push(x); });
            saveStore(); render(); toast(`${arr.length} IBAN içe aktarıldı`,'ok');
          }
        } else throw new Error('format');
      }catch{ toast('Geçersiz dosya','err'); }
    };
    r.readAsText(f);
    e.target.value = '';
  }

  function updateStats(){
    $('#stTotal').textContent = `${ibans.length} IBAN`;
    $('#stFav').textContent = `${ibans.filter(x=>x.favorite).length} Favori`;
    $('#stRec').textContent = `${ibans.filter(x=>x.lastUsed).length} Son Kullanılan`;
  }

  // ---- Araçlar ----
  function debounce(fn,wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); } }