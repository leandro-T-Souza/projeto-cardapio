// Seleção dos elementos do DOM
const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

// Novo campo de nome do cliente
const nameInput = document.getElementById("customer-name")
const nameWarn = document.getElementById("name-warn")

// Array que guarda os itens do carrinho
let cart = [];

// ---------------------- FUNÇÕES DE MODAL ----------------------

// Abre o modal do carrinho
cartBtn.addEventListener("click", function() {  
  updateCartModal(); // Atualiza os itens antes de abrir
  cartModal.style.display = "flex"
})

// Fecha o modal ao clicar fora dele
cartModal.addEventListener("click", function(event){
  if(event.target === cartModal){
    cartModal.style.display = "none"
  }
})

// Fecha o modal ao clicar no botão "X"
closeModalBtn.addEventListener("click", function(){
  cartModal.style.display = "none"
})

// ---------------------- FUNÇÕES DE CARRINHO ----------------------

// Adiciona item ao carrinho quando clicado no menu
menu.addEventListener("click", function(event){
  let parentButton = event.target.closest(".add-to-cart-btn")
  if(parentButton){
    const name = parentButton.getAttribute("data-name")
    const price = parseFloat(parentButton.getAttribute("data-price"))
    addToCart(name, price)
  }
})

// Função que adiciona item ao carrinho
function addToCart(name, price){
  const existingItem = cart.find(item => item.name === name)
  if(existingItem){
    // Se já existe, apenas aumenta a quantidade
    existingItem.quantity += 1;
  }else{
    // Se não existe, adiciona novo objeto ao array
    cart.push({ name, price, quantity: 1 })
  }
  updateCartModal()
}

// Atualiza o conteúdo do modal do carrinho
function updateCartModal(){
  cartItemsContainer.innerHTML = ""; // Limpa lista
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex","justify-between","mb-4","flex-col")

    // Estrutura HTML de cada item
    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
      </div>
    `
    total += item.price * item.quantity; // Soma total
    cartItemsContainer.appendChild(cartItemElement)
  })

  // Atualiza valor total
  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  // Atualiza contador de itens
  cartCounter.innerHTML = cart.length;
}

// Remove item do carrinho
cartItemsContainer.addEventListener("click", function (event){
  if(event.target.classList.contains("remove-from-cart-btn")){
    const name = event.target.getAttribute("data-name")
    removeItemCart(name);
  }
})

function removeItemCart(name){
  const index = cart.findIndex(item => item.name === name);
  if(index !== -1){
    const item = cart[index];
    if(item.quantity > 1){
      // Se quantidade > 1, apenas diminui
      item.quantity -= 1;
      updateCartModal();
      return;
    }
    // Se quantidade = 1, remove do array
    cart.splice(index, 1);
    updateCartModal();
  }
}

// ---------------------- VALIDAÇÕES ----------------------

// Remove aviso do endereço quando usuário digita
addressInput.addEventListener("input", function(event){
  if(event.target.value !== ""){
    addressInput.classList.remove("border-red-500")
    addressWarn.classList.add("hidden")
  }
})

// Remove aviso do nome quando usuário digita
nameInput.addEventListener("input", function(event){
  if(event.target.value !== ""){
    nameInput.classList.remove("border-red-500")
    nameWarn.classList.add("hidden")
  }
})

// ---------------------- FINALIZAR PEDIDO ----------------------

// Envia pedido para WhatsApp
checkoutBtn.addEventListener("click", function(){
  if (cart.length === 0) return; // Se carrinho vazio, não faz nada

  // Valida nome
  if(nameInput.value === ""){
    nameWarn.classList.remove("hidden")
    nameInput.classList.add("border-red-500")
    return;
  }

  // Valida endereço
  if(addressInput.value === ""){
    addressWarn.classList.remove("hidden")
    addressInput.classList.add("border-red-500")
    return;
  }

  // Verifica se restaurante está aberto
  const isOpen = checkRestaurantOpen();
  if(!isOpen){
    Toastify({
      text: "Ops o restaurante está fechado!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: { background: "#ef4444" },
    }).showToast();
    return;
  }

  // Monta lista de itens formatada
  const cartItems = cart.map((item) => {
    return `🍔 ${item.name} | Qtd: ${item.quantity} | R$${item.price.toFixed(2)}`
  }).join("\n")

  // Mensagem final com nome e endereço
  const message = encodeURIComponent(
    `📋 Pedido de: ${nameInput.value}\n\n${cartItems}\n\n📍 Endereço: ${addressInput.value}`
  )

  const phone = "NUMERO_DO_TELEFONE" // Coloque aqui o número do restaurante

  // Abre WhatsApp com mensagem pronta
  window.open(`https://wa.me/${13981369796}?text=${message}`, "_blank")

  // Limpa carrinho após envio
  cart = [];
  updateCartModal();
})

// ---------------------- HORÁRIO DE FUNCIONAMENTO ----------------------

// Verifica se restaurante está aberto (18h às 22h)
function checkRestaurantOpen(){
  const hora = new Date().getHours();
  return hora >= 6 && hora < 23; // aberto das 6h às 23h
}

// Atualiza cor do span de status
const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();
if(isOpen){
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600")
}else{
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500")
}
