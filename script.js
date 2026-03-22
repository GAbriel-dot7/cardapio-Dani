/* ═══════════════════════════════════════════════════════════════
   DANIELA BRIGADEIROS — script.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── DATA ──────────────────────────────────────────────────────────────────────

const CATALOG = {
  tradicionais: [
    {
      id: 't1',
      emoji: '🍫',
      name: 'Brigadeiro Tradicional',
      desc: 'Granulê de chocolate ao leite ou crocante',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't2',
      emoji: '🥥',
      name: 'Beijinho',
      desc: 'Finalizado com coco ralado',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't3',
      emoji: '🥛',
      name: 'Leite Ninho',
      desc: 'Finalizado com leite Ninho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't4',
      emoji: '🍓',
      name: 'Bicho de pé',
      desc: 'Moranguinho, finalizado com leite Ninho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't5',
      emoji: '🥜',
      name: 'Paçoca',
      desc: 'Finalizado com farofa de paçoca',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't6',
      emoji: '☕',
      name: 'Café',
      desc: 'Finalizado com chocolate em pó',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 't7',
      emoji: '🎊',
      name: 'Brigadeiro com Confete',
      desc: 'Com confetes coloridos',
      priceUni: 3.00,
      priceCento: 180.00,
    },
  ],
  mistos: [
    {
      id: 'm1',
      emoji: '💛',
      name: 'Ninho com Nutella',
      desc: 'Misto de Ninho com Nutella',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 'm2',
      emoji: '🌴',
      name: 'Prestígio',
      desc: 'Brigadeiro com beijinho, finalizado com coco',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 'm3',
      emoji: '🤎',
      name: 'Casadinho',
      desc: 'Chocolate com Ninho, finalizado com Ninho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 'm4',
      emoji: '🌈',
      name: 'Tie Dye',
      desc: 'Ninho com moranguinho, finalizado com Ninho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 'm5',
      emoji: '💕',
      name: 'Sensação',
      desc: 'Misto de brigadeiro com moranguinho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
    {
      id: 'm6',
      emoji: '🇮🇹',
      name: 'Napolitano',
      desc: 'Brigadeiro, Ninho e moranguinho c/ Ninho',
      priceUni: 3.00,
      priceCento: 180.00,
    },
  ],
  embalagem: [
    {
      id: 'e1',
      emoji: '🎁',
      name: 'Caixinha (4 unidades)',
      desc: 'Monte com sabores de sua preferência',
      priceUni: 12.00,
      priceCento: null,
    },
  ],
};

// All items flat map for quick lookup
const ALL_ITEMS = [
  ...CATALOG.tradicionais,
  ...CATALOG.mistos,
  ...CATALOG.embalagem,
];

// ── STATE ─────────────────────────────────────────────────────────────────────

const state = {
  cart: [],           // { id, name, emoji, type, typeLabel, qty, priceUnit }
  orderType: 'retirada',
  modal: {
    item: null,
    type: 'uni',
    qty: 1,
  },
};

// ── UTILS ─────────────────────────────────────────────────────────────────────

const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');

function cartSubtotal() {
  return state.cart.reduce((sum, c) => sum + c.priceUnit * c.qty, 0);
}

function cartTotal() {
  return cartSubtotal() + (state.orderType === 'entrega' ? 5 : 0);
}

function cartCount() {
  return state.cart.reduce((sum, c) => sum + c.qty, 0);
}

// ── TOAST ─────────────────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── RENDER CARDS ──────────────────────────────────────────────────────────────

function renderCards() {
  renderGrid('grid-tradicionais', CATALOG.tradicionais);
  renderGrid('grid-mistos', CATALOG.mistos);
  renderGrid('grid-embalagem', CATALOG.embalagem);
}

function renderGrid(containerId, items) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = items.map(item => buildCardHTML(item)).join('');

  // Bind click
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
  grid.querySelectorAll('.card-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    });
  });
}

function buildCardHTML(item) {
  const inCart = state.cart.some(c => c.id === item.id);
  const displayPrice = item.priceCento ? `${fmt(item.priceUni)}` : fmt(item.priceUni);
  return `
    <div class="card${inCart ? ' in-cart' : ''}" data-id="${item.id}">
      <div class="card-emoji">${item.emoji}</div>
      <div class="card-name">${item.name}</div>
      <div class="card-desc">${item.desc}</div>
      <div class="card-footer">
        <div class="card-price">${displayPrice}</div>
        <button class="card-add-btn" data-id="${item.id}" aria-label="Adicionar ${item.name}">+</button>
      </div>
    </div>
  `;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

function openModal(id) {
  const item = ALL_ITEMS.find(i => i.id === id);
  if (!item) return;

  state.modal.item = item;
  state.modal.type = 'uni';
  state.modal.qty = 1;

  document.getElementById('m-emoji').textContent = item.emoji;
  document.getElementById('m-name').textContent = item.name;
  document.getElementById('m-desc').textContent = item.desc;
  document.getElementById('m-qty').textContent = 1;

  renderModalTypes();
  updateModalSubtotal();

  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}

function renderModalTypes() {
  const item = state.modal.item;
  const types = item.priceCento
    ? [
        { key: 'uni',   label: 'Unidade',  detail: '28g por unidade', price: item.priceUni },
        { key: 'cento', label: 'Cento',    detail: '100 unidades',    price: item.priceCento },
      ]
    : [
        { key: 'uni',   label: 'Unidade',  detail: '28g por unidade', price: item.priceUni },
      ];

  document.getElementById('m-types').innerHTML = types.map(t => `
    <div class="type-opt${state.modal.type === t.key ? ' selected' : ''}" data-type="${t.key}">
      <div class="type-opt-label">${t.label}</div>
      <div class="type-opt-detail">${t.detail}</div>
      <div class="type-opt-price">${fmt(t.price)}</div>
    </div>
  `).join('');

  document.querySelectorAll('.type-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      state.modal.type = opt.dataset.type;
      renderModalTypes();
      updateModalSubtotal();
    });
  });
}

function updateModalSubtotal() {
  const item = state.modal.item;
  const price = state.modal.type === 'cento' ? item.priceCento : item.priceUni;
  document.getElementById('m-subtotal').textContent = fmt(price * state.modal.qty);
}

function changeModalQty(delta) {
  state.modal.qty = Math.max(1, state.modal.qty + delta);
  document.getElementById('m-qty').textContent = state.modal.qty;
  updateModalSubtotal();
}

function addToCart() {
  const { item, type, qty } = state.modal;
  const price = type === 'cento' ? item.priceCento : item.priceUni;
  const typeLabel = type === 'cento' ? 'Cento (100 un.)' : 'Unidade (28g)';

  const existing = state.cart.find(c => c.id === item.id && c.type === type);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      type,
      typeLabel,
      qty,
      priceUnit: price,
    });
  }

  closeModal();
  renderCards();
  renderCart();
  updateGlobalUI();
  showToast(`${item.emoji} ${item.name} adicionado!`);
}

// ── CART RENDER ───────────────────────────────────────────────────────────────

function renderCart() {
  const listEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('order-summary');

  if (!state.cart.length) {
    emptyEl.style.display = 'flex';
    listEl.innerHTML = '';
    summaryEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  summaryEl.style.display = 'flex';

  listEl.innerHTML = state.cart.map((c, i) => `
    <div class="cart-item" data-index="${i}">
      <div class="cart-item-info">
        <div class="cart-item-name">${c.emoji} ${c.name}</div>
        <div class="cart-item-type">${c.typeLabel}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" data-action="minus" data-index="${i}">−</button>
        <span class="qty-val">${c.qty}</span>
        <button class="qty-btn" data-action="plus" data-index="${i}">+</button>
      </div>
      <div class="cart-item-price">${fmt(c.priceUnit * c.qty)}</div>
      <button class="cart-item-remove" data-action="remove" data-index="${i}" aria-label="Remover">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');

  // Bind cart controls
  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const action = btn.dataset.action;
      if (action === 'plus') {
        state.cart[idx].qty++;
      } else if (action === 'minus') {
        state.cart[idx].qty--;
        if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
      } else if (action === 'remove') {
        state.cart.splice(idx, 1);
      }
      renderCards();
      renderCart();
      updateGlobalUI();
    });
  });

  // Update summary
  const isEntrega = state.orderType === 'entrega';
  document.getElementById('val-subtotal').textContent = fmt(cartSubtotal());
  document.getElementById('val-total').textContent = fmt(cartTotal());
  document.getElementById('row-delivery').style.display = isEntrega ? 'flex' : 'none';
}

// ── GLOBAL UI (sticky bar, tab badge) ─────────────────────────────────────────

function updateGlobalUI() {
  const count = cartCount();
  const total = cartTotal();

  // Tab badge
  const badge = document.getElementById('tab-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  // Sticky bar
  const bar = document.getElementById('sticky-bar');
  if (count > 0) {
    bar.classList.add('visible');
    document.getElementById('sticky-total').textContent = fmt(total);
  } else {
    bar.classList.remove('visible');
  }
}

// ── TABS ──────────────────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

// ── ORDER TYPE ────────────────────────────────────────────────────────────────

function initOrderType() {
  document.querySelectorAll('.order-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.orderType = btn.dataset.type;
      renderCart();
      updateGlobalUI();
    });
  });
}

// ── WHATSAPP ──────────────────────────────────────────────────────────────────

function finalizarPedido() {
  if (!state.cart.length) {
    showToast('Adicione itens ao pedido primeiro!');
    // Switch to menu tab
    document.querySelector('[data-tab="menu"]').click();
    return;
  }

  const dateInput = document.getElementById('input-date');
  if (!dateInput.value) {
    // Switch to pedido tab and focus date
    document.querySelector('[data-tab="pedido"]').click();
    dateInput.focus();
    showToast('Informe a data do pedido!');
    return;
  }

  const dateFormatted = new Date(dateInput.value + 'T12:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const isEntrega = state.orderType === 'entrega';
  const subtotal = cartSubtotal();
  const total = cartTotal();

  let msg = `🍫 *Olá, Daniela! Gostaria de fazer um pedido:*\n\n`;
  msg += `📅 *Data:* ${dateFormatted}\n`;
  msg += `🚚 *Tipo:* ${isEntrega ? 'Entrega' : 'Retirada'}\n\n`;
  msg += `*─── Itens ───*\n`;

  state.cart.forEach(c => {
    msg += `${c.emoji} ${c.name}\n`;
    msg += `   ${c.typeLabel} × ${c.qty} = ${fmt(c.priceUnit * c.qty)}\n`;
  });

  msg += `\n💰 *Subtotal:* ${fmt(subtotal)}`;
  if (isEntrega) msg += `\n🛵 *Entrega:* R$ 5,00`;
  msg += `\n\n✅ *Total: ${fmt(total)}*`;
  msg += `\n\n_Pedido feito pelo cardápio digital_`;

  const phone = '5519997125214';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── INIT ──────────────────────────────────────────────────────────────────────

function init() {
  // Set min date = today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('input-date').min = today;

  // Render menu
  renderCards();

  // Tabs
  initTabs();

  // Order type
  initOrderType();

  // Modal qty buttons
  document.getElementById('qty-minus').addEventListener('click', () => changeModalQty(-1));
  document.getElementById('qty-plus').addEventListener('click', () => changeModalQty(1));

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-backdrop')) closeModal();
  });

  // Add to cart button
  document.getElementById('btn-add-to-cart').addEventListener('click', addToCart);

  // Keyboard ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

document.addEventListener('DOMContentLoaded', init);