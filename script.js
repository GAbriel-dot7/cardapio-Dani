/* ═══════════════════════════════════════════════════════════════
   DANIELA BRIGADEIROS — script.js v3
   Arquitetura: caixas em primeiro lugar, fluxo guiado de sabores
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   DADOS
   ══════════════════════════════════════════════════════════════ */

const BOXES = [
  {
    id: 'box20',
    label: 'Caixa 20',
    qty: 20,
    maxFlavors: 1,
    flavorDesc: '1 sabor',
    price: 36.00,
    seal: null,
    accent: '#d4607a',
    featured: false,
  },
  {
    id: 'box30',
    label: 'Caixa 30',
    qty: 30,
    maxFlavors: 1,
    flavorDesc: '1 sabor',
    price: 54.00,
    seal: null,
    accent: '#d4607a',
    featured: false,
  },
  {
    id: 'box50',
    label: 'Caixa 50',
    qty: 50,
    maxFlavors: 2,
    flavorDesc: 'até 2 sabores',
    price: 90.00,
    seal: 'Mais pedido',
    accent: '#d4607a',
    featured: true,
  },
  {
    id: 'box100',
    label: 'Caixão 100',
    qty: 100,
    maxFlavors: 4,
    flavorDesc: 'até 4 sabores',
    price: 180.00,
    seal: 'Melhor valor',
    accent: '#c07840',
    featured: false,
  },
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
    { id: 'm1', name: 'Ninho com Nutella', desc: 'Misto de Ninho com Nutella',                           accent: '#B8934A' },
    { id: 'm2', name: 'Prestígio',         desc: 'Brigadeiro com beijinho, finalizado com coco',         accent: '#7A9C6A' },
    { id: 'm3', name: 'Casadinho',         desc: 'Chocolate com Ninho, finalizado com Ninho',            accent: '#8B7355' },
    { id: 'm4', name: 'Tie Dye',           desc: 'Ninho com moranguinho, finalizado com Ninho',          accent: '#A07890' },
    { id: 'm5', name: 'Sensação',          desc: 'Misto de brigadeiro com moranguinho',                  accent: '#9C5A5A' },
    { id: 'm6', name: 'Napolitano',        desc: 'Brigadeiro, Ninho e moranguinho c/ Ninho',             accent: '#6A7A5A' },
  ],
};

const ALL_FLAVORS = [...FLAVORS.tradicionais, ...FLAVORS.mistos];

const EXTRAS = [
  {
    id: 'uni',
    name: 'Unidade avulsa',
    desc: '28g por unidade',
    price: 3.00,
    accent: '#8B5E3C',
  },
  {
    id: 'emb',
    name: 'Caixinha 4 un.',
    desc: 'Monte com sabores de sua preferência',
    price: 12.00,
    accent: '#9A6A9A',
  },
];

/* ══════════════════════════════════════════════════════════════
   ESTADO
   ══════════════════════════════════════════════════════════════ */

const state = {
  cart: [],
  orderType: 'retirada',

  // modal
  modal: {
    mode: null,       // 'box' | 'unit'
    item: null,       // box or extra object
    step: 'info',     // 'info' | 'flavors'
    selectedFlavors: [],
    qty: 1,
  },
};

/* ══════════════════════════════════════════════════════════════
   UTILITÁRIOS
   ══════════════════════════════════════════════════════════════ */

const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');

function cartSubtotal() {
  return state.cart.reduce((s, c) => s + c.price * c.qty, 0);
}
function cartTotal() {
  return cartSubtotal() + (state.orderType === 'entrega' ? 5 : 0);
}
function cartCount() {
  return state.cart.reduce((s, c) => s + c.qty, 0);
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ══════════════════════════════════════════════════════════════
   RENDER — CARDÁPIO
   ══════════════════════════════════════════════════════════════ */

function renderAll() {
  renderBoxes();
  renderFlavors('grid-tradicionais', FLAVORS.tradicionais);
  renderFlavors('grid-mistos', FLAVORS.mistos);
  renderExtras();
}

/* ── caixas ─── */
function renderBoxes() {
  const grid = document.getElementById('boxes-grid');
  grid.innerHTML = BOXES.map(box => {
    const inCart = state.cart.some(c => c.sourceId === box.id);
    const pricePerUni = (box.price / box.qty).toFixed(2).replace('.', ',');
    return `
      <div class="box-card${box.featured ? ' featured' : ''}${inCart ? ' in-cart' : ''}"
           data-box="${box.id}" role="button" tabindex="0">
        ${box.seal ? `<div class="box-seal">${box.seal}</div>` : ''}
        <div class="box-qty">${box.qty}</div>
        <div class="box-unit-label">unidades</div>
        <div class="box-flavor-info">${box.flavorDesc}</div>
        <div class="box-price">${fmt(box.price)}</div>
        <div class="box-price-per">R$ ${pricePerUni} / un.</div>
        <div class="box-btn">${inCart ? 'Adicionar mais' : 'Selecionar'}</div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.box-card').forEach(card => {
    const open = () => openBoxModal(card.dataset.box);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });
}

/* ── sabores (lista) ─── */
function renderFlavors(containerId, list) {
  const el = document.getElementById(containerId);
  el.innerHTML = list.map(f => `
    <div class="flavor-row" data-flavor="${f.id}">
      <div class="flavor-dot" style="background:${f.accent}"></div>
      <div class="flavor-row-info">
        <div class="flavor-row-name">${f.name}</div>
        <div class="flavor-row-desc">${f.desc}</div>
      </div>
      <div class="flavor-row-price">R$ 3,00</div>
      <button class="flavor-add-btn" data-flavor="${f.id}" aria-label="Adicionar unidade de ${f.name}">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `).join('');

  el.querySelectorAll('.flavor-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openUnitModal(btn.dataset.flavor);
    });
  });
  el.querySelectorAll('.flavor-row').forEach(row => {
    row.addEventListener('click', () => openUnitModal(row.dataset.flavor));
  });
}

/* ── extras ─── */
function renderExtras() {
  const grid = document.getElementById('extras-grid');
  grid.innerHTML = EXTRAS.map(ex => `
    <div class="extra-card" data-extra="${ex.id}">
      <div class="extra-card-name">${ex.name}</div>
      <div class="extra-card-desc">${ex.desc}</div>
      <div class="extra-card-price">${fmt(ex.price)}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.extra-card').forEach(card => {
    card.addEventListener('click', () => openUnitModal(card.dataset.extra, true));
  });
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CAIXA
   ══════════════════════════════════════════════════════════════ */

function openBoxModal(boxId) {
  const box = BOXES.find(b => b.id === boxId);
  if (!box) return;

  state.modal.mode = 'box';
  state.modal.item = box;
  state.modal.step = 'info';
  state.modal.selectedFlavors = [];

  // Fill step info
  document.getElementById('m-badge').textContent = `${box.qty} unidades`;
  document.getElementById('m-title').textContent = box.label;
  document.getElementById('m-desc').textContent =
    `${box.flavorDesc} · R$ ${(box.price / box.qty).toFixed(2).replace('.', ',')} por unidade`;
  document.getElementById('m-price').textContent = fmt(box.price);

  showStep('info');
  openModal();
}

document.getElementById('btn-choose-flavors').addEventListener('click', () => {
  const box = state.modal.item;
  state.modal.selectedFlavors = [];
  document.getElementById('m-title-2').textContent = box.label;
  document.getElementById('m-hint').textContent =
    box.maxFlavors === 1
      ? 'Escolha 1 sabor'
      : `Escolha até ${box.maxFlavors} sabores`;

  renderFlavorPicker();
  showStep('flavors');
});

document.getElementById('btn-back-to-info').addEventListener('click', () => {
  showStep('info');
});

function renderFlavorPicker(filter = '') {
  const box = state.modal.item;
  const list = ALL_FLAVORS.filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase()) ||
    f.desc.toLowerCase().includes(filter.toLowerCase())
  );

  document.getElementById('flavor-pick-list').innerHTML = list.map(f => {
    const selected = state.modal.selectedFlavors.includes(f.id);
    const maxReached = state.modal.selectedFlavors.length >= box.maxFlavors;
    const disabled = !selected && maxReached;
    return `
      <div class="flavor-pick-item${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}"
           data-fid="${f.id}">
        <div class="flavor-pick-dot" style="background:${f.accent}"></div>
        <div class="flavor-pick-info">
          <div class="flavor-pick-name">${f.name}</div>
          <div class="flavor-pick-desc">${f.desc}</div>
        </div>
        <div class="flavor-pick-check">
          ${selected ? '<i class="fa-solid fa-check"></i>' : ''}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.flavor-pick-item:not(.disabled)').forEach(item => {
    item.addEventListener('click', () => toggleFlavor(item.dataset.fid));
  });

  updateFlavorCounter();
}

function toggleFlavor(fid) {
  const box = state.modal.item;
  const idx = state.modal.selectedFlavors.indexOf(fid);
  if (idx > -1) {
    state.modal.selectedFlavors.splice(idx, 1);
  } else {
    if (state.modal.selectedFlavors.length >= box.maxFlavors) return;
    state.modal.selectedFlavors.push(fid);
  }
  const search = document.getElementById('flavor-search').value;
  renderFlavorPicker(search);
}

function updateFlavorCounter() {
  const box = state.modal.item;
  const count = state.modal.selectedFlavors.length;
  const max = box.maxFlavors;
  const label = document.getElementById('flavor-count-label');
  label.textContent = `${count} de ${max} sabor${max > 1 ? 'es' : ''} selecionado${count !== 1 ? 's' : ''}`;

  const btn = document.getElementById('btn-confirm-flavors');
  btn.disabled = count === 0;
}

document.getElementById('btn-confirm-flavors').addEventListener('click', () => {
  const box = state.modal.item;
  const flavorNames = state.modal.selectedFlavors
    .map(fid => ALL_FLAVORS.find(f => f.id === fid)?.name)
    .filter(Boolean);

  const desc = flavorNames.length
    ? flavorNames.join(' · ')
    : `${box.qty} unidades`;

  const existing = state.cart.find(c =>
    c.sourceId === box.id &&
    c.flavors?.join() === state.modal.selectedFlavors.join()
  );

  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({
      id: `${box.id}_${Date.now()}`,
      sourceId: box.id,
      name: box.label,
      desc,
      flavors: [...state.modal.selectedFlavors],
      price: box.price,
      qty: 1,
      accent: box.accent,
    });
  }

  closeModal();
  renderAll();
  renderCart();
  updateGlobalUI();
  showToast(`${box.label} adicionada ao pedido`);
});

/* ══════════════════════════════════════════════════════════════
   MODAL — UNIDADE / EXTRA
   ══════════════════════════════════════════════════════════════ */

function openUnitModal(id, isExtra = false) {
  let item;
  if (isExtra) {
    item = EXTRAS.find(e => e.id === id);
  } else {
    item = ALL_FLAVORS.find(f => f.id === id);
    if (!item) item = EXTRAS.find(e => e.id === id);
  }
  if (!item) return;

  state.modal.mode = 'unit';
  state.modal.item = item;
  state.modal.qty = 1;

  document.getElementById('m-unit-title').textContent = item.name;
  document.getElementById('m-unit-desc').textContent = item.desc;
  document.getElementById('m-unit-price').textContent = fmt(item.price);
  document.getElementById('m-qty').textContent = 1;
  document.getElementById('m-unit-subtotal').textContent = fmt(item.price);

  showStep('unit');
  openModal();
}

document.getElementById('qty-minus').addEventListener('click', () => changeUnitQty(-1));
document.getElementById('qty-plus').addEventListener('click',  () => changeUnitQty(1));

function changeUnitQty(delta) {
  state.modal.qty = Math.max(1, state.modal.qty + delta);
  document.getElementById('m-qty').textContent = state.modal.qty;
  document.getElementById('m-unit-subtotal').textContent =
    fmt(state.modal.item.price * state.modal.qty);
}

document.getElementById('btn-add-unit').addEventListener('click', () => {
  const item = state.modal.item;
  const qty = state.modal.qty;

  const existing = state.cart.find(c => c.sourceId === item.id && c.flavors == null);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: `${item.id}_${Date.now()}`,
      sourceId: item.id,
      name: item.name,
      desc: item.desc,
      flavors: null,
      price: item.price,
      qty,
      accent: item.accent,
    });
  }

  closeModal();
  renderCart();
  updateGlobalUI();
  showToast(`${item.name} adicionado ao pedido`);
});

/* ══════════════════════════════════════════════════════════════
   MODAL — CONTROLES GERAIS
   ══════════════════════════════════════════════════════════════ */

function showStep(step) {
  document.getElementById('modal-step-info').style.display    = step === 'info'    ? 'block' : 'none';
  document.getElementById('modal-step-flavors').style.display = step === 'flavors' ? 'block' : 'none';
  document.getElementById('modal-step-unit').style.display    = step === 'unit'    ? 'block' : 'none';
}

function openModal() {
  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
  // reset search
  const s = document.getElementById('flavor-search');
  if (s) s.value = '';
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

document.getElementById('flavor-search').addEventListener('input', e => {
  renderFlavorPicker(e.target.value);
});

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
    </div>
  `).join('');

  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      const action = btn.dataset.action;
      if (action === 'plus') {
        state.cart[i].qty++;
      } else if (action === 'minus') {
        state.cart[i].qty--;
        if (state.cart[i].qty <= 0) state.cart.splice(i, 1);
      } else if (action === 'remove') {
        state.cart.splice(i, 1);
      }
      renderAll();
      renderCart();
      updateGlobalUI();
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
  const total = cartTotal();

  const badge = document.getElementById('tab-badge');
  badge.textContent    = count;
  badge.style.display  = count ? 'inline-block' : 'none';

  const bar = document.getElementById('sticky-bar');
  bar.classList.toggle('visible', count > 0);

  if (count) {
    document.getElementById('sticky-total').textContent = fmt(total);
  }
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
    renderCart();
    updateGlobalUI();
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

  const dateStr = new Date(dateInput.value + 'T12:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const isEntrega = state.orderType === 'entrega';
  const subtotal  = cartSubtotal();
  const total     = cartTotal();

  let msg = `🍫 *Olá, Daniela! Gostaria de fazer um pedido:*\n\n`;
  msg += `📅 *Data:* ${dateStr}\n`;
  msg += `📦 *Tipo:* ${isEntrega ? 'Entrega' : 'Retirada'}\n\n`;
  msg += `*Itens do pedido:*\n`;

  state.cart.forEach(c => {
    msg += `▸ ${c.name}`;
    if (c.qty > 1) msg += ` × ${c.qty}`;
    if (c.desc) msg += ` — _${c.desc}_`;
    msg += ` → *${fmt(c.price * c.qty)}*\n`;
  });

  msg += `\n💰 Subtotal: ${fmt(subtotal)}`;
  if (isEntrega) msg += `\n🛵 Taxa de entrega: R$ 5,00`;
  msg += `\n\n✅ *Total: ${fmt(total)}*`;
  msg += `\n\n_Pedido via cardápio digital_`;

  window.open(`https://wa.me/5519997125214?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */

function init() {
  // min date = hoje
  document.getElementById('input-date').min = new Date().toISOString().split('T')[0];

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);