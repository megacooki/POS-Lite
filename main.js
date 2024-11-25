// Key to store card data in localStorage
const LOCAL_STORAGE_KEY = "cards";

// Select the container where cards are added
const leftContainer = document.querySelector('.left');

// Select the form and input fields for adding a product
const addCardForm = document.getElementById('addCardForm');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');

// Select the form and input fields for deleting a product
const deleteCardForm = document.getElementById('deleteCardForm');
const deleteProductNameInput = document.getElementById('deleteProductName');

// Function to load cards from localStorage
function loadCards() {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return {};
}

// Function to save cards to localStorage
function saveCards(cards) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
}

// Function to reload the UI
function reload() {
  // Clear existing cards in the DOM
  leftContainer.innerHTML = "";

  // Load cards from localStorage
  const cards = loadCards();

  // Render each card
  Object.entries(cards).forEach(([productName, cardData]) => {
    createCardElement(productName, cardData);
  });
}

// Function to create a new card element and append it to the DOM
function createCardElement(productName, cardData) {
  const { price, stock, sales, revenue } = cardData;

  // Create the card element
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('data-product', productName);
  card.setAttribute('data-price', price);

  // Populate the card's HTML
  card.innerHTML = `
    <div class="top">
      <p class="product">${productName}</p>
      <p class="sold">Sales: ${sales}</p>
      <p class="revenue">Revenue: £${revenue.toFixed(2)}</p>
      <br>
    </div>
    <div class="bottom">
      <p class="add">+</p>
      <p class="amount">${stock}</p>
      <p class="price">£${parseFloat(price).toFixed(2)}</p>
    </div>
  `;

  // Update card background color if stock is 0
  if (stock === 0) {
    card.style.backgroundColor = "#f05451"; // Red for out of stock
  } else {
    card.style.backgroundColor = ""; // Reset to default if in stock
  }

  // Attach event listeners for sales and stock updates
  const addButton = card.querySelector('.add');
  addButton.addEventListener('click', () => incrementStock(productName));

  card.querySelector('.top').addEventListener('click', () => handleCardClick(productName, parseFloat(price)));

  // Append the card to the DOM
  leftContainer.appendChild(card);
}


// Function to handle form submission for adding new products
addCardForm.addEventListener('submit', event => {
  event.preventDefault();

  // Get product name and price from input fields
  const productName = productNameInput.value.trim();
  const productPrice = parseFloat(productPriceInput.value).toFixed(2);

  if (!productName) {
    alert("Product name is required.");
    return;
  }

  // Load existing cards
  const cards = loadCards();

  // Check if the product already exists
  if (cards[productName]) {
    alert("Product already exists.");
    return;
  }

  // Create a new card object
  cards[productName] = {
    price: productPrice,
    stock: 0,
    sales: 0,
    revenue: 0
  };

  // Save the new card to localStorage
  saveCards(cards);

  // Clear the form inputs
  productNameInput.value = '';
  productPriceInput.value = '';

  // Reload the UI
  reload();
});

// Function to handle form submission for deleting products
deleteCardForm.addEventListener('submit', event => {
  event.preventDefault();

  // Get the product name from the input field
  const productName = deleteProductNameInput.value.trim();

  if (!productName) {
    alert("Product name is required.");
    return;
  }

  // Load existing cards
  const cards = loadCards();

  // Check if the product exists
  if (!cards[productName]) {
    alert("Product not found.");
    return;
  }

  // Delete the product
  delete cards[productName];

  // Save updated cards to localStorage
  saveCards(cards);

  // Clear the form input
  deleteProductNameInput.value = '';

  // Reload the UI
  reload();

  alert(`Product "${productName}" has been deleted.`);
});

// Function to handle card clicks (increment sales and update revenue)
function handleCardClick(productName, price) {
  const cards = loadCards();

  // Find the card to update
  const card = cards[productName];
  if (!card) return;

  // Check if stock is zero
  if (card.stock === 0) {
    alert(`"${productName}" is out of stock and cannot be purchased.`);
    return; // Exit the function to prevent further actions
  }

  // Increment sales and update revenue
  card.sales += 1;
  card.revenue += price;

  let currentCart = parseFloat(localStorage.getItem("cart")) || 0; // Get current cart value or default to 0
  currentCart += price; // Add the new price
  localStorage.setItem("cart", currentCart); // Store updated value

  let currentSold = parseFloat(localStorage.getItem("sold")) || 0; // Get current cart value or default to 0
  currentSold += 1; // Add the new price
  localStorage.setItem("sold", currentSold); // Store updated value

  let currentRevenue = parseFloat(localStorage.getItem("revenue")) || 0; // Get current cart value or default to 0
  currentRevenue += price; // Add the new price
  localStorage.setItem("revenue", currentRevenue); // Store updated value
  

  // Decrement stock (but not below 0)
  card.stock = Math.max(card.stock - 1, 0);

  // Save updated cards to localStorage
  saveCards(cards);

  // Reload the UI
  reload();
  stats();
}


// Function to increment stock
function incrementStock(productName) {
  const cards = loadCards();

  // Find the card to update
  const card = cards[productName];
  if (!card) return;

  // Increment stock
  card.stock += 1;

  // Save updated cards to localStorage
  saveCards(cards);

  // Reload the UI
  reload();
}

function stats() {
  if (localStorage.getItem("cart") != null) {
    document.getElementById('cart').innerText = "Cart: £" + parseFloat(localStorage.getItem("cart")).toFixed(2);
  }
  if (localStorage.getItem("sold") != null) {
    document.getElementById('sold').innerText = "Products Sold: " + parseFloat(localStorage.getItem("sold"));
  }
  if (localStorage.getItem("revenue") != null) {
    document.getElementById('revenue').innerText = "Revenue: £" + parseFloat(localStorage.getItem("revenue")).toFixed(2);
  }
}

function reset_stats() {
  if (confirm("Are you sure you want to clear all stats?")) {
    localStorage.setItem("revenue", 0)
    localStorage.setItem("sold", 0)
    stats();
  }
}
function reset_cart() {
  localStorage.setItem("cart", 0)
  stats();
}

// Initialize the UI on page load
reload();
stats()
