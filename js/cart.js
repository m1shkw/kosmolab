// корзина 
document.addEventListener("DOMContentLoaded", () => {
    const cartRoot = document.querySelector(".catalog-cart");
    if (!cartRoot) return;

    const cartButton = document.querySelector(".catalog-cart-button");
    const itemsRoot = cartRoot.querySelector(".catalog-cart__items");
    const emptyMessage = cartRoot.querySelector(".catalog-cart__empty");
    const checkoutButton = cartRoot.querySelector(".catalog-cart__checkout");
    const successPopup = document.querySelector(".catalog-success");
    const successButton = successPopup
        ? successPopup.querySelector(".catalog-success__button")
        : null;

    const PRICE = 88.88;
    const CURRENCY_SRC = "./assets/images/catalog/ksl-currency.svg";

    let cart = [];

    // данные товара из плюсика */
    function readProduct(button) {
        const id = button.dataset.productId || "";
        const rawName = (button.dataset.productName || "").trim();
        const isPlanet = button.classList.contains("catalog-planets__add");

        let image = button.dataset.productImage || "";
        if (!image) {
            const card = button.closest(".catalog-planets__item, .catalog-merch__item");
            const img = card && card.querySelector(".catalog-planets__image, .catalog-merch__image");
            if (img) image = img.getAttribute("src") || "";
        }

        let line1;
        let line2;
        if (isPlanet) {
            line1 = "МИНИ-ПЛАНЕТА";
            line2 = "«" + rawName.toUpperCase() + "»";
        } else {
            line1 = rawName.toUpperCase();
            line2 = "KOSMOLAB";
        }

        return { id, line1, line2, image, price: PRICE, quantity: 1 };
    }

    // опирации с корзиной
    function addToCart(product) {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push(product);
        }
        render();
    }

    function changeQuantity(id, delta) {
        const item = cart.find((entry) => entry.id === id);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter((entry) => entry.id !== id);
        }
        render();
    }


    function render() {
        const hasItems = cart.length > 0;

        itemsRoot.innerHTML = cart
            .map(
                (item) => `
            <article class="catalog-cart__item" data-id="${item.id}">
                <div class="catalog-cart__image">
                    <img src="${item.image}" alt="">
                </div>
                <div class="catalog-cart__body">
                    <h3 class="catalog-cart__title text-microcopy">
                        <span>${item.line1}</span>
                        <span>${item.line2}</span>
                    </h3>
                    <span class="catalog-cart__price text-microcopy">
                        <img class="catalog-cart__currency" src="${CURRENCY_SRC}" alt="">
                        ${item.price.toFixed(2)}
                    </span>
                </div>
                <div class="catalog-cart__qty">
                    <button class="catalog-cart__qty-button" type="button" data-action="dec" aria-label="Уменьшить количество"></button>
                    <span class="catalog-cart__qty-value text-body">${item.quantity}</span>
                    <button class="catalog-cart__qty-button catalog-cart__qty-button--plus" type="button" data-action="inc" aria-label="Увеличить количество"></button>
                </div>
            </article>`
            )
            .join("");

        if (emptyMessage) emptyMessage.hidden = hasItems;
        if (checkoutButton) checkoutButton.hidden = !hasItems;
    }

    // открытие / закрытие
    function openCart() {
        cartRoot.classList.add("is-open");
    }

    function closeCart() {
        cartRoot.classList.remove("is-open");
    }

    function openSuccess() {
        if (successPopup) {
            successPopup.classList.add("is-open");
            successPopup.setAttribute("aria-hidden", "false");
        }
    }

    function closeSuccess() {
        if (successPopup) {
            successPopup.classList.remove("is-open");
            successPopup.setAttribute("aria-hidden", "true");
        }
    }

    function toggleCart() {
        if (cartRoot.classList.contains("is-open")) {
            closeCart();
        } else {
            openCart();
        }
    }

    // события
    document
        .querySelectorAll(".catalog-planets__add, .catalog-merch__add")
        .forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                closeSuccess();
                addToCart(readProduct(button));
                openCart();
            });
        });

    if (cartButton) {
        cartButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            closeSuccess();
            toggleCart();
        });
    }

    itemsRoot.addEventListener("click", (event) => {
        event.stopPropagation();

        const button = event.target.closest(".catalog-cart__qty-button");
        if (!button) return;

        const row = button.closest(".catalog-cart__item");
        if (!row) return;

        changeQuantity(row.dataset.id, button.dataset.action === "inc" ? 1 : -1);
    });

    if (checkoutButton) {
        checkoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            closeCart();
            openSuccess();
        });
    }

    if (successButton) {
        successButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            cart = [];
            render();
            closeSuccess();
            closeCart();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeCart();
            closeSuccess();
        }
    });

    cartRoot.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    if (successPopup) {
        successPopup.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    document.addEventListener("click", (event) => {
        const cartOpen = cartRoot.classList.contains("is-open");
        const successOpen = successPopup && successPopup.classList.contains("is-open");

        if (!cartOpen && !successOpen) return;

        if (cartRoot.contains(event.target)) return;
        if (successPopup && successPopup.contains(event.target)) return;
        if (cartButton && cartButton.contains(event.target)) return;
        if (event.target.closest(".catalog-planets__add, .catalog-merch__add")) return;

        closeCart();
        closeSuccess();
    });

    render();
});