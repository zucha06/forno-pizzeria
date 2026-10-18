const cart = new Map();

const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
let toastTimeout;

document.getElementById("year").textContent = new Date().getFullYear();

function formatPrice(price) {
  return `${price.toLocaleString("pl-PL")} zł`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(card) {
  const id = card.dataset.id;
  const item = {
    id,
    name: card.dataset.name,
    price: Number(card.dataset.price)
  };
  const current = cart.get(id);
  cart.set(id, { ...item, quantity: current ? current.quantity + 1 : 1 });
  renderCart();
  showToast(`Dodano: ${item.name}`);
}

function changeQuantity(id, change) {
  const item = cart.get(id);
  if (!item) return;
  const quantity = item.quantity + change;
  if (quantity <= 0) cart.delete(id);
  else cart.set(id, { ...item, quantity });
  renderCart();
}

function removeItem(id) {
  cart.delete(id);
  renderCart();
}

function renderCart() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);

  if (!items.length) {
    cartItems.innerHTML = `<div class="empty-cart"><span>＋</span><p>Twój koszyk jest pusty.</p><small>Dodaj coś pysznego z naszego menu.</small></div>`;
    return;
  }

  cartItems.innerHTML = items.map(item => `
    <div class="cart-line">
      <div>
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)} / szt.</p>
      </div>
      <div class="cart-line-right">
        <strong>${formatPrice(item.price * item.quantity)}</strong>
        <div class="quantity-controls">
          <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Zmniejsz ilość ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}" aria-label="Zwiększ ilość ${item.name}">+</button>
          <button type="button" class="remove-item" data-action="remove" data-id="${item.id}">Usuń</button>
        </div>
      </div>
    </div>
  `).join("");
}

function openCart() {
  cartPanel.classList.add("open");
  cartBackdrop.classList.add("visible");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartBackdrop.classList.remove("visible");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => addToCart(button.closest(".pizza-card")));
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "increase") changeQuantity(id, 1);
  if (action === "decrease") changeQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.size) {
    showToast("Najpierw dodaj pizzę do koszyka.");
    return;
  }
  showToast("To wersja demonstracyjna — zamówienia są wyłączone.");
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(filter => filter.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.filter;
    document.querySelectorAll(".pizza-card").forEach(card => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
  });
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Zamknij menu" : "Otwórz menu");
  menuToggle.textContent = isOpen ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});
