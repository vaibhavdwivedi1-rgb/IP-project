/* global ALL_BOOKS */

document.addEventListener('DOMContentLoaded', () => {
    // --- THEME MANAGEMENT ---
    const themeToggle = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // This function ONLY syncs the icon based on the current theme class on the <html> element.
    const syncThemeIcon = () => {
        if (document.documentElement.classList.contains('dark')) {
            lightIcon?.classList.remove('hidden');
            darkIcon?.classList.add('hidden');
        } else {
            darkIcon?.classList.remove('hidden');
            lightIcon?.classList.add('hidden');
        }
    };

    // This function handles the click event.
    const themeSwitch = () => {
        // Toggle the class on the <html> element
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light'); // Update storage
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark'); // Update storage
        }
        syncThemeIcon(); // Update the icon to match the new state
    };

    // Attach the event listener if the button exists
    if (themeToggle) {
        themeToggle.addEventListener('click', themeSwitch);
    }
    
    // --- STATE MANAGEMENT ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- UTILITY FUNCTIONS ---
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const showToast = (message) => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    window.handleImageError = (img) => {
        const title = img.alt;
        const placeholderUrl = `https://placehold.co/400x600/e2e8f0/475569?text=${encodeURIComponent(title)}`;
        img.onerror = null; 
        img.src = placeholderUrl;
    };

    // --- RENDER FUNCTIONS ---
    const renderBooks = (books, container) => {
        if (!container) return;
        container.innerHTML = '';
        if (books.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No books found.</p>';
            return;
        }
        books.forEach(book => {
            const bookCard = `
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300">
                    <img src="${book.img}" alt="${book.title}" class="w-full h-64 object-cover" onerror="handleImageError(this)">
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-lg font-semibold theme-text flex-grow">${book.title}</h3>
                        <p class="text-slate-600 dark:text-slate-400">${book.author}</p>
                        <div class="flex justify-between items-center mt-4">
                            <span class="text-xl font-bold theme-text">₹${book.price.toFixed(2)}</span>
                            <button class="add-to-cart-btn bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-amber-500 dark:hover:bg-amber-600 transition-colors" data-title="${book.title}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += bookCard;
        });
    };

    const updateCartIcon = () => {
        const cartIcons = document.querySelectorAll('.cart-icon');
        if (cartIcons.length === 0) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcons.forEach(icon => {
            icon.setAttribute('data-count', totalItems);
            if (totalItems > 0) {
                icon.classList.add('has-items');
            } else {
                icon.classList.remove('has-items');
            }
        });
    };

    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalContainer = document.getElementById('cart-total');
        if (!cartItemsContainer || !cartTotalContainer) return;

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center text-slate-500 dark:text-slate-400 py-8">Your cart is empty.</td></tr>';
            cartTotalContainer.textContent = '₹0.00';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const book = ALL_BOOKS.find(b => b.title === item.title);
            if (!book) return;

            total += book.price * item.quantity;
            const cartRow = `
                <tr class="border-b border-slate-200 dark:border-slate-700">
                    <td class="py-4 px-2">
                        <div class="flex items-center space-x-4">
                            <img src="${book.img}" alt="${book.title}" class="w-16 h-24 object-cover rounded" onerror="handleImageError(this)">
                            <div>
                                <p class="font-semibold text-slate-800 dark:text-slate-200">${book.title}</p>
                                <p class="text-sm text-slate-500 dark:text-slate-400">${book.author}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-2 text-center text-slate-700 dark:text-slate-300">₹${book.price.toFixed(2)}</td>
                    <td class="py-4 px-2 text-center text-slate-700 dark:text-slate-300">${item.quantity}</td>
                    <td class="py-4 px-2 text-center text-slate-700 dark:text-slate-300">₹${(book.price * item.quantity).toFixed(2)}</td>
                    <td class="py-4 px-2 text-center">
                        <button class="remove-from-cart-btn text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors" data-title="${book.title}">Remove</button>
                    </td>
                </tr>
            `;
            cartItemsContainer.innerHTML += cartRow;
        });

        cartTotalContainer.textContent = `₹${total.toFixed(2)}`;
    };

    // --- EVENT HANDLERS ---
    const handleAddToCart = (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const title = e.target.dataset.title;
            const existingItem = cart.find(item => item.title === title);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ title: title, quantity: 1 });
            }
            saveCart();
            updateCartIcon();
            showToast('Added to cart!');
        }
    };

    const handleRemoveFromCart = (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const title = e.target.dataset.title;
            cart = cart.filter(item => item.title !== title);
            saveCart();
            renderCartItems();
            updateCartIcon();
            showToast('Item removed from cart.');
        }
    };

    // --- PAGE INITIALIZATION ---
    syncThemeIcon(); // Sync icon on initial page load
    updateCartIcon();
    
    document.body.addEventListener('click', handleAddToCart);

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const page = document.body.dataset.page;

    if (page === 'home') {
        const bookListContainer = document.getElementById('book-list');
        const searchBar = document.getElementById('search-bar');
        const featuredBooks = ALL_BOOKS.filter(book => book.featured);
        renderBooks(featuredBooks, bookListContainer);

        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm.length > 0) {
                    const filteredBooks = ALL_BOOKS.filter(book =>
                        book.title.toLowerCase().includes(searchTerm) ||
                        book.author.toLowerCase().includes(searchTerm)
                    );
                    renderBooks(filteredBooks, bookListContainer);
                } else {
                    renderBooks(featuredBooks, bookListContainer);
                }
            });
        }
    } else if (page === 'category') {
        const categoryBookList = document.getElementById('category-book-list');
        const categoryTitle = document.getElementById('category-title');
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        if (category && categoryBookList && categoryTitle) {
            document.title = `${category} - BOOKWAGAN`;
            categoryTitle.textContent = category;
            const booksInCategory = ALL_BOOKS.filter(book => book.category === category);
            renderBooks(booksInCategory, categoryBookList);
        }
    } else if (page === 'cart') {
        const cartItemsContainer = document.getElementById('cart-items');
        renderCartItems();
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', handleRemoveFromCart);
        }
    }
});

