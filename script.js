/* ═══════════════════════════════════════════════════════════════
   DANIELA BRIGADEIROS — script.js v3.1
   Lógica de slots: cada unidade avulsa = 1 slot de sabor
                    cada caixinha = 4 slots de sabor
                    quantidade × slots = total a preencher
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   DADOS
   ══════════════════════════════════════════════════════════════ */

const BOXES = [
  { id: 'box20',  label: 'Caixa 20',   qty: 20,  maxFlavors: 1, flavorDesc: '1 sabor',       price: 36.00,  seal: null,           accent: '#d4607a', featured: false },
  { id: 'box30',  label: 'Caixa 30',   qty: 30,  maxFlavors: 1, flavorDesc: '1 sabor',       price: 54.00,  seal: null,           accent: '#d4607a', featured: false },
  { id: 'box50',  label: 'Caixa 50',   qty: 50,  maxFlavors: 2, flavorDesc: 'até 2 sabores', price: 90.00,  seal: 'Mais pedido',  accent: '#d4607a', featured: true  },
  { id: 'box100', label: 'Caixão 100', qty: 100, maxFlavors: 4, flavorDesc: 'até 4 sabores', price: 180.00, seal: 'Melhor valor', accent: '#c07840', featured: false },
];

// slotsPerUnit: quantos slots de sabor cada unidade do produto requer
const EXTRAS = [
  { id: 'uni', name: 'Unidade avulsa', desc: '28g — escolha o sabor de cada unidade', price: 3.00,  accent: '#8B5E3C', slotsPerUnit: 1 },
  { id: 'emb', name: 'Caixinha 4 un.', desc: '4 brigadeiros — 1 sabor por unidade',   price: 12.00, accent: '#9A6A9A', slotsPerUnit: 4 },
];

const FLAVORS = {
  tradicionais: [
    { id: 't1', name: 'Brigadeiro Tradicional', desc: 'Granulê de chocolate ao leite ou crocante', accent: '#8B5E3C' },
    { id: 't2', name: 'Beijinho',               desc: 'Finalizado com coco ralado',                accent: '#C4A882' },
    { id: 't3', name: 'Leite Ninho',             desc: 'Finalizado com leite Ninho',               accent: '#D4B896' },
    { id: 't4', name: 'Bicho de Pé',             desc: 'Moranguinho, finalizado com leite Ninho',  accent: '#A0604A' },
    { id: 't5', name: 'Paçoca',                  desc: 'Finalizado com farofa de paçoca',          accent: '#9C7A4A' },
    { id: 't6', name: 'Café',                    desc: 'Finalizado com chocolate em pó',           accent: '#5C4033' },
    { id: 't7', name: 'Brigadeiro com Confete',  desc: 'Com granulado colorido',                   accent: '#9A6A9A' },
  ],
  mistos: [
    { id: 'm1', name: 'Ninho com Nutella', desc: 'Misto de Ninho com Nutella',                   accent: '#B8934A' },
    { id: 'm2', name: 'Prestígio',         desc: 'Brigadeiro com beijinho, finalizado com coco', accent: '#7A9C6A' },
    { id: 'm3', name: 'Casadinho',         desc: 'Chocolate com Ninho, finalizado com Ninho',    accent: '#8B7355' },
    { id: 'm4', name: 'Tie Dye',           desc: 'Ninho com moranguinho, finalizado com Ninho',  accent: '#A07890' },
    { id: 'm5', name: 'Sensação',          desc: 'Misto de brigadeiro com moranguinho',          accent: '#9C5A5A' },
    { id: 'm6', name: 'Napolitano',        desc: 'Brigadeiro, Ninho e moranguinho c/ Ninho',     accent: '#6A7A5A' },
  ],
};

const ALL_FLAVORS = [...FLAVORS.tradicionais, ...FLAVORS.mistos];
const flavorById  = id => ALL_FLAVORS.find(f => f.id === id) || null;

/* ══════════════════════════════════════════════════════════════
   ESTADO
   ══════════════════════════════════════════════════════════════ */

const state = {
  cart: [],
  orderType: 'retirada',
  modal: {
    mode: null,       // 'box' | 'extra'
    item: null,
    // caixa
    boxFlavors: [],
    // extra
    extraQty:   1,
    slots:      [],   // array[totalSlots] de flavorId|null
    activeSlot: 0,
  },
};

/* ══════════════════════════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════════════════════════ */

const fmt          = v  => 'R$ ' + v.toFixed(2).replace('.', ',');
const cartSubtotal = () => state.cart.reduce((s, c) => s + c.price * c.qty, 0);
const cartTotal    = () => cartSubtotal() + (state.orderType === 'entrega' ? 5 : 0);
const cartCount    = () => state.cart.reduce((s, c) => s + c.qty, 0);

let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ══════════════════════════════════════════════════════════════
   RENDER — CARDÁPIO
   ══════════════════════════════════════════════════════════════ */

function renderAll() {
  renderBoxes();
  renderFlavors('grid-tradicionais', FLAVORS.tradicionais);
  renderFlavors('grid-mistos',       FLAVORS.mistos);
  renderExtras();
}

function renderBoxes() {
  const grid = document.getElementById('boxes-grid');
  grid.innerHTML = BOXES.map(box => {
    const inCart = state.cart.some(c => c.sourceId === box.id);
    const perUni = (box.price / box.qty).toFixed(2).replace('.', ',');
    return `
      <div class="box-card${box.featured ? ' featured' : ''}${inCart ? ' in-cart' : ''}"
           data-box="${box.id}" role="button" tabindex="0">
        ${box.seal ? `<div class="box-seal">${box.seal}</div>` : ''}
        <div class="box-qty">${box.qty}</div>
        <div class="box-unit-label">unidades</div>
        <div class="box-flavor-info">${box.flavorDesc}</div>
        <div class="box-price">${fmt(box.price)}</div>
        <div class="box-btn">${inCart ? 'Adicionar mais' : 'Selecionar'}</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.box-card').forEach(card => {
    const open = () => openBoxModal(card.dataset.box);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });
}

function renderFlavors(containerId, list) {
  const el = document.getElementById(containerId);
  el.innerHTML = list.map(f => `
    <div class="flavor-row flavor-row--display" data-flavor="${f.id}">
      <div class="flavor-dot" style="background:${f.accent}"></div>
      <div class="flavor-row-info">
        <div class="flavor-row-name">${f.name}</div>
        <div class="flavor-row-desc">${f.desc}</div>
      </div>
    </div>`).join('');
}

function renderExtras() {
  const grid = document.getElementById('extras-grid');
  grid.innerHTML = EXTRAS.map(ex => `
    <div class="extra-card" data-extra="${ex.id}" role="button" tabindex="0">
      <div class="extra-card-name">${ex.name}</div>
      <div class="extra-card-desc">${ex.desc}</div>
      <div class="extra-card-price">${fmt(ex.price)}</div>
    </div>`).join('');

  grid.querySelectorAll('.extra-card').forEach(card => {
    card.addEventListener('click', () => openExtraModal(card.dataset.extra));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openExtraModal(card.dataset.extra); });
  });
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CAIXAS  (info → escolher sabores)
   ══════════════════════════════════════════════════════════════ */

function openBoxModal(boxId) {
  const box = BOXES.find(b => b.id === boxId);
  if (!box) return;

  state.modal.mode       = 'box';
  state.modal.item       = box;
  state.modal.boxFlavors = [];

  document.getElementById('m-badge').textContent = `${box.qty} unidades`;
  document.getElementById('m-title').textContent = box.label;
  document.getElementById('m-desc').textContent  =
    `${box.flavorDesc} · R$ ${(box.price / box.qty).toFixed(2).replace('.', ',')} por unidade`;
  document.getElementById('m-price').textContent = fmt(box.price);

  showStep('info');
  openModal();
}

document.getElementById('btn-choose-flavors').addEventListener('click', () => {
  const box = state.modal.item;
  state.modal.boxFlavors = [];
  document.getElementById('m-title-2').textContent = box.label;
  document.getElementById('m-hint').textContent    =
    box.maxFlavors === 1 ? 'Escolha 1 sabor' : `Escolha até ${box.maxFlavors} sabores`;
  document.getElementById('flavor-search').value  = '';
  renderBoxFlavorPicker();
  showStep('flavors');
});

document.getElementById('btn-back-to-info').addEventListener('click', () => showStep('info'));

function renderBoxFlavorPicker(filter = '') {
  const box  = state.modal.item;
  const list = ALL_FLAVORS.filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase()) ||
    f.desc.toLowerCase().includes(filter.toLowerCase())
  );
  document.getElementById('flavor-pick-list').innerHTML = list.map(f => {
    const sel      = state.modal.boxFlavors.includes(f.id);
    const maxHit   = state.modal.boxFlavors.length >= box.maxFlavors;
    const disabled = !sel && maxHit;
    return `
      <div class="flavor-pick-item${sel ? ' selected' : ''}${disabled ? ' disabled' : ''}" data-fid="${f.id}">
        <div class="flavor-pick-dot" style="background:${f.accent}"></div>
        <div class="flavor-pick-info">
          <div class="flavor-pick-name">${f.name}</div>
          <div class="flavor-pick-desc">${f.desc}</div>
        </div>
        <div class="flavor-pick-check">${sel ? '<i class="fa-solid fa-check"></i>' : ''}</div>
      </div>`;
  }).join('');

  document.querySelectorAll('#flavor-pick-list .flavor-pick-item:not(.disabled)').forEach(item => {
    item.addEventListener('click', () => {
      const fid = item.dataset.fid;
      const idx = state.modal.boxFlavors.indexOf(fid);
      if (idx > -1) state.modal.boxFlavors.splice(idx, 1);
      else if (state.modal.boxFlavors.length < box.maxFlavors) state.modal.boxFlavors.push(fid);
      renderBoxFlavorPicker(document.getElementById('flavor-search').value);
    });
  });

  const count = state.modal.boxFlavors.length;
  const max   = box.maxFlavors;
  document.getElementById('flavor-count-label').textContent =
    `${count} de ${max} sabor${max > 1 ? 'es' : ''} selecionado${count !== 1 ? 's' : ''}`;
  document.getElementById('btn-confirm-flavors').disabled = count === 0;
}

document.getElementById('flavor-search').addEventListener('input',
  e => renderBoxFlavorPicker(e.target.value));

document.getElementById('btn-confirm-flavors').addEventListener('click', () => {
  const box         = state.modal.item;
  const flavorNames = state.modal.boxFlavors.map(id => flavorById(id)?.name).filter(Boolean);
  const desc        = flavorNames.join(' · ') || `${box.qty} unidades`;
  const accent      = flavorById(state.modal.boxFlavors[0])?.accent || box.accent;

  state.cart.push({
    id: `${box.id}_${Date.now()}`,
    sourceId: box.id,
    name: box.label, desc, price: box.price, qty: 1, accent,
  });

  closeModal(); renderAll(); renderCart(); updateGlobalUI();
  showToast(`${box.label} adicionada ao pedido`);
});

/* ══════════════════════════════════════════════════════════════
   MODAL — EXTRAS
   Fluxo:  extra-qty  →  extra-flavors
   Regra:  total_slots = extraQty × slotsPerUnit
           Ex: 3 caixinhas × 4 = 12 slots para preencher
               5 unidades × 1  = 5 slots para preencher
   ══════════════════════════════════════════════════════════════ */

function openExtraModal(extraId, presetFid = null) {
  const extra = EXTRAS.find(e => e.id === extraId);
  if (!extra) return;

  state.modal.mode     = 'extra';
  state.modal.item     = extra;
  state.modal.extraQty = 1;

  // Inicializa slots para 1 unidade
  state.modal.slots = Array(extra.slotsPerUnit).fill(null);

  // Pré-preenche slot 0 se veio de um clique num sabor
  if (presetFid) {
    state.modal.slots[0]   = presetFid;
    // Ativa próximo slot vazio, ou fica no 0 se só tem 1 slot
    state.modal.activeSlot = extra.slotsPerUnit > 1 ? 1 : 0;
  } else {
    state.modal.activeSlot = 0;
  }

  document.getElementById('m-unit-title').textContent    = extra.name;
  document.getElementById('m-unit-desc').textContent     = extra.desc;
  document.getElementById('m-unit-price').textContent    = fmt(extra.price);
  document.getElementById('m-qty').textContent           = 1;
  document.getElementById('m-unit-subtotal').textContent = fmt(extra.price);

  showStep('unit-qty');
  openModal();
}

document.getElementById('qty-minus').addEventListener('click', () => changeExtraQty(-1));
document.getElementById('qty-plus').addEventListener('click',  () => changeExtraQty(1));

function changeExtraQty(delta) {
  const extra          = state.modal.item;
  state.modal.extraQty = Math.max(1, state.modal.extraQty + delta);
  const qty            = state.modal.extraQty;
  document.getElementById('m-qty').textContent           = qty;
  document.getElementById('m-unit-subtotal').textContent = fmt(extra.price * qty);
}

document.getElementById('btn-unit-next').addEventListener('click', () => {
  const extra      = state.modal.item;
  const totalSlots = state.modal.extraQty * extra.slotsPerUnit;

  // Redimensiona array preservando o que já estava preenchido
  const prev = state.modal.slots.slice(0, totalSlots);
  while (prev.length < totalSlots) prev.push(null);
  state.modal.slots = prev;

  // Ativa o primeiro slot vazio
  const firstEmpty = prev.findIndex(s => s === null);
  state.modal.activeSlot = firstEmpty !== -1 ? firstEmpty : 0;

  renderExtraFlavorsHeader();
  renderSlotsAndList();
  showStep('unit-flavors');
});

document.getElementById('btn-back-to-unit-qty').addEventListener('click', () => showStep('unit-qty'));

function renderExtraFlavorsHeader() {
  const extra      = state.modal.item;
  const qty        = state.modal.extraQty;
  const spu        = extra.slotsPerUnit;
  const totalSlots = qty * spu;
  const unitWord   = extra.id === 'emb' ? 'caixinha' : 'unidade';

  document.getElementById('m-unit-title-2').textContent = extra.name;
  document.getElementById('m-unit-hint').textContent =
    spu === 1
      ? `${qty} ${unitWord}${qty > 1 ? 's' : ''} — escolha ${totalSlots} sabor${totalSlots !== 1 ? 'es' : ''}`
      : `${qty} ${unitWord}${qty > 1 ? 's' : ''} × ${spu} brigadeiros = ${totalSlots} sabores`;
}

function renderSlotsAndList(filter = '') {
  const extra      = state.modal.item;
  const qty        = state.modal.extraQty;
  const spu        = extra.slotsPerUnit;
  const slots      = state.modal.slots;
  const activeSlot = state.modal.activeSlot;
  const unitWord   = extra.id === 'emb' ? 'Caixinha' : 'Unidade';

  /* ── Chips de slots ── */
  let slotsHtml = '<div class="slots-container">';
  for (let u = 0; u < qty; u++) {
    if (qty > 1) slotsHtml += `<div class="slot-unit-label">${unitWord} ${u + 1}</div>`;
    slotsHtml += '<div class="slots-row">';
    for (let s = 0; s < spu; s++) {
      const idx    = u * spu + s;
      const flavor = slots[idx] ? flavorById(slots[idx]) : null;
      const active = idx === activeSlot;
      slotsHtml += `
        <div class="slot-chip${active ? ' slot-chip--active' : ''}${flavor ? ' slot-chip--filled' : ''}"
             data-slot="${idx}" role="button" tabindex="0">
          ${flavor
            ? `<span class="slot-dot" style="background:${flavor.accent}"></span>
               <span class="slot-name">${flavor.name}</span>
               <button class="slot-clear" data-slot="${idx}" aria-label="Remover sabor">
                 <i class="fa-solid fa-xmark"></i>
               </button>`
            : `<span class="slot-empty-icon"><i class="fa-solid fa-plus"></i></span>
               <span class="slot-empty-label">Sabor ${s + 1}</span>`
          }
        </div>`;
    }
    slotsHtml += '</div>';
  }
  slotsHtml += '</div>';

  /* ── Lista de sabores ── */
  const list = ALL_FLAVORS.filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase()) ||
    f.desc.toLowerCase().includes(filter.toLowerCase())
  );

  const counts = {};
  slots.forEach(fid => { if (fid) counts[fid] = (counts[fid] || 0) + 1; });

  const listHtml = `
    <div class="slot-section-label">
      ${activeSlot >= 0
        ? `Preenchendo sabor ${activeSlot + 1} de ${slots.length}`
        : 'Toque num slot acima para escolher o sabor'}
    </div>
    <div class="slot-flavor-search-wrap">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input type="text" id="slot-flavor-search" class="flavor-search"
             placeholder="Buscar sabor..." value="${filter}" />
    </div>
    <div class="slot-flavor-items">
      ${list.map(f => {
        const isCurrent = activeSlot >= 0 && slots[activeSlot] === f.id;
        const badge     = counts[f.id] ? `<span class="slot-flavor-badge">${counts[f.id]}×</span>` : '';
        return `
          <div class="flavor-pick-item${isCurrent ? ' selected' : ''}" data-fid="${f.id}">
            <div class="flavor-pick-dot" style="background:${f.accent}"></div>
            <div class="flavor-pick-info">
              <div class="flavor-pick-name">${f.name} ${badge}</div>
              <div class="flavor-pick-desc">${f.desc}</div>
            </div>
            <div class="flavor-pick-check">${isCurrent ? '<i class="fa-solid fa-check"></i>' : ''}</div>
          </div>`;
      }).join('')}
    </div>`;

  document.getElementById('unit-slots-list').innerHTML = slotsHtml + listHtml;

  /* ── Eventos: clicar num slot ── */
  document.querySelectorAll('.slot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.modal.activeSlot = parseInt(chip.dataset.slot);
      renderSlotsAndList(document.getElementById('slot-flavor-search')?.value || '');
    });
  });

  /* ── Eventos: limpar slot ── */
  document.querySelectorAll('.slot-clear').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.slot);
      state.modal.slots[idx]  = null;
      state.modal.activeSlot  = idx;
      renderSlotsAndList(document.getElementById('slot-flavor-search')?.value || '');
    });
  });

  /* ── Eventos: selecionar sabor ── */
  document.querySelectorAll('.slot-flavor-items .flavor-pick-item').forEach(item => {
    item.addEventListener('click', () => {
      if (state.modal.activeSlot < 0) return;
      state.modal.slots[state.modal.activeSlot] = item.dataset.fid;

      // Avança automaticamente para o próximo slot vazio
      const after    = state.modal.slots.findIndex((s, i) => i > state.modal.activeSlot && s === null);
      const anyEmpty = state.modal.slots.findIndex(s => s === null);
      if (after !== -1)          state.modal.activeSlot = after;
      else if (anyEmpty !== -1)  state.modal.activeSlot = anyEmpty;
      // se todos preenchidos, mantém o ativo atual

      renderSlotsAndList(document.getElementById('slot-flavor-search')?.value || '');
    });
  });

  /* ── Busca ── */
  document.getElementById('slot-flavor-search')?.addEventListener('input', e => {
    renderSlotsAndList(e.target.value);
  });

  /* ── Contador e botão confirmar ── */
  const filled = slots.filter(s => s !== null).length;
  const total  = slots.length;
  document.getElementById('unit-slot-counter').textContent =
    `${filled} de ${total} sabor${total !== 1 ? 'es' : ''} preenchido${filled !== 1 ? 's' : ''}`;
  document.getElementById('btn-confirm-unit-flavors').disabled = filled < total;
}

document.getElementById('btn-confirm-unit-flavors').addEventListener('click', () => {
  const extra    = state.modal.item;
  const qty      = state.modal.extraQty;
  const slots    = state.modal.slots;
  const spu      = extra.slotsPerUnit;
  const unitWord = extra.id === 'emb' ? 'Cx.' : '';

  const groups = [];
  for (let u = 0; u < qty; u++) {
    const names  = slots.slice(u * spu, (u + 1) * spu).map(id => flavorById(id)?.name).filter(Boolean);
    const prefix = qty > 1 ? `[${u + 1}] ` : '';
    groups.push(prefix + names.join(' · '));
  }
  const desc   = groups.join('  ');
  const accent = flavorById(slots[0])?.accent || extra.accent;

  state.cart.push({
    id:       `${extra.id}_${Date.now()}`,
    sourceId: extra.id,
    name:     extra.name,
    desc,
    slots:    [...slots],
    price:    extra.price,
    qty,
    accent,
  });

  closeModal(); renderAll(); renderCart(); updateGlobalUI();
  showToast(`${extra.name} adicionado${qty > 1 ? ` (×${qty})` : ''} ao pedido`);
});

/* ══════════════════════════════════════════════════════════════
   MODAL — CONTROLES GERAIS
   ══════════════════════════════════════════════════════════════ */

function showStep(step) {
  ['info', 'flavors', 'unit-qty', 'unit-flavors'].forEach(s => {
    const el = document.getElementById(`modal-step-${s}`);
    if (el) el.style.display = s === step ? 'block' : 'none';
  });
}

function openModal() {
  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-backdrop')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════════════════════
   CARRINHO
   ══════════════════════════════════════════════════════════════ */

function renderCart() {
  const listEl    = document.getElementById('cart-items');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('order-summary');

  if (!state.cart.length) {
    emptyEl.style.display   = 'flex';
    listEl.innerHTML        = '';
    summaryEl.style.display = 'none';
    return;
  }
  emptyEl.style.display   = 'none';
  summaryEl.style.display = 'flex';

  listEl.innerHTML = state.cart.map((c, i) => `
    <div class="cart-item">
      <div class="cart-item-dot" style="background:${c.accent}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-type">${c.desc || ''}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" data-action="minus" data-i="${i}">−</button>
        <span class="qty-val">${c.qty}</span>
        <button class="qty-btn" data-action="plus"  data-i="${i}">+</button>
      </div>
      <div class="cart-item-price">${fmt(c.price * c.qty)}</div>
      <button class="cart-item-remove" data-action="remove" data-i="${i}" aria-label="Remover">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`).join('');

  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      const a = btn.dataset.action;
      if (a === 'plus')   state.cart[i].qty++;
      if (a === 'minus') { state.cart[i].qty--; if (state.cart[i].qty <= 0) state.cart.splice(i, 1); }
      if (a === 'remove') state.cart.splice(i, 1);
      renderAll(); renderCart(); updateGlobalUI();
    });
  });

  const isEntrega = state.orderType === 'entrega';
  document.getElementById('val-subtotal').textContent   = fmt(cartSubtotal());
  document.getElementById('val-total').textContent      = fmt(cartTotal());
  document.getElementById('row-delivery').style.display = isEntrega ? 'flex' : 'none';
}

/* ══════════════════════════════════════════════════════════════
   UI GLOBAL
   ══════════════════════════════════════════════════════════════ */

function updateGlobalUI() {
  const count = cartCount();
  const badge = document.getElementById('tab-badge');
  badge.textContent   = count;
  badge.style.display = count ? 'inline-block' : 'none';
  document.getElementById('sticky-bar').classList.toggle('visible', count > 0);
  if (count) document.getElementById('sticky-total').textContent = fmt(cartTotal());
}

/* ══════════════════════════════════════════════════════════════
   TABS
   ══════════════════════════════════════════════════════════════ */

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
  });
});

/* ══════════════════════════════════════════════════════════════
   TIPO DE PEDIDO
   ══════════════════════════════════════════════════════════════ */

document.querySelectorAll('.order-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.orderType = btn.dataset.type;
    renderCart(); updateGlobalUI();
  });
});

/* ══════════════════════════════════════════════════════════════
   WHATSAPP
   ══════════════════════════════════════════════════════════════ */

function finalizarPedido() {
  if (!state.cart.length) {
    showToast('Adicione itens ao pedido primeiro');
    document.querySelector('[data-tab="cardapio"]').click();
    return;
  }
  const dateInput = document.getElementById('input-date');
  if (!dateInput.value) {
    document.querySelector('[data-tab="pedido"]').click();
    dateInput.focus();
    showToast('Informe a data do pedido');
    return;
  }

  const dateStr   = new Date(dateInput.value + 'T12:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const isEntrega = state.orderType === 'entrega';
  const total     = cartTotal();

  let msg = `🍫 *Olá, Daniela! Gostaria de fazer um pedido:*\n\n`;
  msg += `📅 *Data:* ${dateStr}\n`;
  msg += `📦 *Tipo:* ${isEntrega ? 'Entrega' : 'Retirada'}\n\n`;
  msg += `*Itens:*\n`;
  state.cart.forEach(c => {
    msg += `▸ *${c.name}*`;
    if (c.qty > 1) msg += ` × ${c.qty}`;
    msg += ` → ${fmt(c.price * c.qty)}\n`;
    if (c.desc) msg += `   _${c.desc}_\n`;
  });
  msg += `\n💰 Subtotal: ${fmt(cartSubtotal())}`;
  if (isEntrega) msg += `\n🛵 Entrega: R$ 5,00`;
  msg += `\n\n✅ *Total: ${fmt(total)}*\n_Pedido via cardápio digital_`;

  window.open(`https://wa.me/5519997125214?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  loadSavedPrices();
  document.getElementById('input-date').min = new Date().toISOString().split('T')[0];
  renderAll();
});

/* ══════════════════════════════════════════════════════════════
   ADMIN — preços editáveis, protegidos por senha, persistidos
   em localStorage. Senha padrão: daniela123
   ══════════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD  = 'daniela123';
const ADMIN_STORE_KEY = 'daniela_prices_v1';

// Preços originais (usados para reset)
const ORIGINAL_PRICES = {
  boxes:  Object.fromEntries(BOXES.map(b  => [b.id,  b.price])),
  extras: Object.fromEntries(EXTRAS.map(e => [e.id,  e.price])),
};

/* Carrega preços salvos do localStorage e aplica ao catálogo */
function loadSavedPrices() {
  try {
    const raw = localStorage.getItem(ADMIN_STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.boxes)  BOXES.forEach(b  => { if (saved.boxes[b.id]  != null) b.price  = saved.boxes[b.id];  });
    if (saved.extras) EXTRAS.forEach(e => { if (saved.extras[e.id] != null) e.price = saved.extras[e.id]; });
  } catch (_) {}
}

function savePrices() {
  const data = {
    boxes:  Object.fromEntries(BOXES.map(b  => [b.id,  b.price])),
    extras: Object.fromEntries(EXTRAS.map(e => [e.id,  e.price])),
  };
  localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(data));
}

function resetPrices() {
  BOXES.forEach(b  => { b.price  = ORIGINAL_PRICES.boxes[b.id];  });
  EXTRAS.forEach(e => { e.price = ORIGINAL_PRICES.extras[e.id]; });
  localStorage.removeItem(ADMIN_STORE_KEY);
}

/* Abre / fecha painel */
function openAdminBackdrop() {
  document.getElementById('admin-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('admin-password').value = '';
  document.getElementById('admin-error').style.display = 'none';
  showAdminStep('login');
}
function closeAdminBackdrop() {
  document.getElementById('admin-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}
function showAdminStep(step) {
  document.getElementById('admin-step-login').style.display = step === 'login' ? 'block' : 'none';
  document.getElementById('admin-step-panel').style.display = step === 'panel' ? 'block' : 'none';
}

/* Renderiza campos editáveis */
function renderAdminPanel() {
  document.getElementById('admin-boxes-list').innerHTML = BOXES.map(b => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${b.label}</div>
        <div class="admin-item-sub">${b.qty} un. · ${b.flavorDesc}</div>
      </div>
      <div class="admin-price-field">
        <span class="admin-currency">R$</span>
        <input type="number" class="admin-price-input" data-type="box" data-id="${b.id}"
               value="${b.price.toFixed(2)}" min="0" step="0.01" />
      </div>
    </div>`).join('');

  document.getElementById('admin-extras-list').innerHTML = EXTRAS.map(e => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-name">${e.name}</div>
        <div class="admin-item-sub">${e.desc}</div>
      </div>
      <div class="admin-price-field">
        <span class="admin-currency">R$</span>
        <input type="number" class="admin-price-input" data-type="extra" data-id="${e.id}"
               value="${e.price.toFixed(2)}" min="0" step="0.01" />
      </div>
    </div>`).join('');
}

/* Coleta valores dos inputs e aplica */
function applyAdminInputs() {
  document.querySelectorAll('.admin-price-input').forEach(input => {
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0) return;
    if (input.dataset.type === 'box') {
      const b = BOXES.find(b => b.id === input.dataset.id);
      if (b) b.price = val;
    } else {
      const e = EXTRAS.find(e => e.id === input.dataset.id);
      if (e) e.price = val;
    }
  });
}

/* Event listeners do admin */
document.getElementById('btn-open-admin').addEventListener('click', openAdminBackdrop);
document.getElementById('admin-close').addEventListener('click', closeAdminBackdrop);
document.getElementById('admin-backdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('admin-backdrop')) closeAdminBackdrop();
});

document.getElementById('btn-admin-login').addEventListener('click', () => {
  const pwd = document.getElementById('admin-password').value;
  if (pwd === ADMIN_PASSWORD) {
    renderAdminPanel();
    showAdminStep('panel');
  } else {
    document.getElementById('admin-error').style.display = 'block';
    document.getElementById('admin-password').focus();
  }
});
document.getElementById('admin-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-admin-login').click();
});

document.getElementById('btn-admin-logout').addEventListener('click', () => {
  showAdminStep('login');
});

document.getElementById('btn-admin-save').addEventListener('click', () => {
  applyAdminInputs();
  savePrices();
  renderAll();
  closeAdminBackdrop();
  showToast('Preços atualizados com sucesso');
});

document.getElementById('btn-admin-reset').addEventListener('click', () => {
  if (!confirm('Restaurar todos os preços para os valores originais?')) return;
  resetPrices();
  renderAdminPanel();
  renderAll();
  showToast('Preços restaurados');
});