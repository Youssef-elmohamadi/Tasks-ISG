function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var displayElement = document.querySelector("#displayYear");
    if (displayElement) {
        displayElement.innerHTML = currentYear;
    }
}

function myMap() {
    var mapElement = document.getElementById("googleMap");
    if (mapElement) {
        var mapProp = {
            center: new google.maps.LatLng(40.712775, -74.005973),
            zoom: 18,
        };
        var map = new google.maps.Map(mapElement, mapProp);
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((t, p) => t + p.quantity, 0);
    $("#cart-count").text(count);
}

function showCartPopup() {
    $("#cart-popup-done").addClass("show");
    setTimeout(() => {
        $("#cart-popup-done").removeClass("show");
    }, 2000);
}

function renderCartPopup() {
    const cart = getCart();
    const cartContainer = $('#cart-popup .cart-items-container');
    const subtotalEl = $('#cart-popup .subtotal');

    if (!cartContainer.length) return; 
    
    const templateItem = cartContainer.find('.cart-item').first();
    if (!templateItem.length) return; 

    templateItem.hide();
    cartContainer.find('.dynamic-item').remove();
    cartContainer.find('.empty-cart-msg').remove();

    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.append('<p class="empty-cart-msg" style="text-align: center; padding: 20px;">عربتك فارغة.</p>');
        subtotalEl.text('0.00 جنيه');
        return;
    }

    cart.forEach(product => {
        const newItem = templateItem.clone();
        newItem.addClass('dynamic-item');
        newItem.attr('data-id', product.id);
        newItem.find('img').attr('src', product.image).attr('alt', product.name);
        newItem.find('.item-name').text(product.name);
        newItem.find('.item-price').text(`${product.price.toFixed(2)} جنيه`);
        newItem.find('input[type="number"]').val(product.quantity);
        newItem.show();
        cartContainer.append(newItem);
        subtotal += (product.price * product.quantity);
    });

    subtotalEl.text(`${subtotal.toFixed(2)} جنيه`);
}

function renderCartPage() {
    const cart = getCart();
    const tableBody = $('#cart-table-body');
    const templateRow = tableBody.find('.cart-item-template');
    const summary = $('#cart-summary');
    const emptyCartMsg = $('#empty-cart-message');
    const cartTable = $('.cart-table');
    const cartActions = $('.cart-page-actions'); 

    tableBody.find('.dynamic-item').remove();

    let subtotal = 0;

    if (cart.length === 0) {
        emptyCartMsg.show();
        cartTable.hide();
        summary.hide();
        cartActions.hide();
        return;
    }

    emptyCartMsg.hide();
    cartTable.show();
    summary.show();
    cartActions.show();

    cart.forEach(product => {
        const newRow = templateRow.clone();
        const itemTotal = product.price * product.quantity;

        newRow.removeClass('cart-item-template');
        newRow.addClass('dynamic-item');
        newRow.attr('data-id', product.id);
        
        newRow.find('img').attr('src', product.image).attr('alt', product.name);
        newRow.find('.product-name').text(product.name);
        newRow.find('.product-price').text(`${product.price.toFixed(2)} جنيه`);
        newRow.find('.quantity-input').val(product.quantity);
        newRow.find('.product-total').text(`${itemTotal.toFixed(2)} جنيه`);

        newRow.show();
        tableBody.append(newRow);
        subtotal += itemTotal;
    });

    summary.find('.subtotal-value').text(`${subtotal.toFixed(2)} جنيه`);
    summary.find('.total-value').text(`${subtotal.toFixed(2)} جنيه`);
}

function renderCheckoutPage() {
    const cart = getCart();
    const itemsListContainer = $('#checkout-items-list');
    
    if (cart.length === 0) {
        alert("عربتك فارغة! لا يمكنك إتمام الطلب.");
        window.location.href = "cart.html";
        return;
    }

    itemsListContainer.html('');

    let subtotal = 0;
    const deliveryFee = 15.00; 

    cart.forEach(product => {
        const itemTotal = product.price * product.quantity;
        subtotal += itemTotal;

        const itemHtml = `
        <div class="summary-item">
            <span>(${product.quantity}x) ${product.name}</span>
            <span>${itemTotal.toFixed(2)} جنيه</span>
        </div>
        `;
        itemsListContainer.append(itemHtml);
    });

    const total = subtotal + deliveryFee;
    
    $('#checkout-subtotal').text(`${subtotal.toFixed(2)} جنيه`);
    $('#checkout-delivery').text(`${deliveryFee.toFixed(2)} جنيه`);
    $('#checkout-total').text(`${total.toFixed(2)} جنيه`);
}


$(window).on('load', function () {
    if ($(".grid").length > 0) {
        var $grid = $(".grid").isotope({
            itemSelector: ".all",
            percentPosition: false,
            masonry: {
                columnWidth: ".all"
            }
        });

        $('.filters_menu li').click(function () {
            $('.filters_menu li').removeClass('active');
            $(this).addClass('active');
            var data = $(this).attr('data-filter');
            $grid.isotope({
                filter: data
            });
        });
    }
});


$(document).ready(function () {

    $("#header").load("inc/header.html", function () {
        var currentPage = window.location.pathname.split("/").pop();
        if (currentPage === "") currentPage = "index.html";
        $('#header a[href="' + currentPage + '"]').addClass('active');
        updateCartCount(); 
    });

    $("#footer").load("inc/footer.html", function () {
        getYear();
    });

    if ($("#cartPopup").length > 0) {
        $("#cartPopup").load("inc/cartPopup.html", function () {
            function closeCartPopup() {
                $('#cart-popup').fadeOut(300);
                $('body').removeClass('modal-open');
            }

            $('.cart_link').click(function (e) {
                e.preventDefault();
                renderCartPopup();
                $('#cart-popup').fadeIn(300);
                $('body').addClass('modal-open');
            });

            $('.cart-close-btn').click(function () { closeCartPopup(); });
            $('.continue-shopping').click(function () { closeCartPopup(); });
            $('#cart-popup').click(function (e) {
                if ($(e.target).is('#cart-popup')) {
                    closeCartPopup();
                }
            });

            $('#cart-popup').on('click', '.remove-btn', function () {
                const cartItem = $(this).closest('.cart-item');
                const productId = cartItem.data('id');
                if (!productId) return;
                let cart = getCart();
                cart = cart.filter(p => p.id != productId);
                saveCart(cart);
                renderCartPopup();
                updateCartCount();
            });

            $('#cart-popup').on('change', 'input[type="number"]', function () {
                const cartItem = $(this).closest('.cart-item');
                const productId = cartItem.data('id');
                const newQuantity = parseInt($(this).val());
                if (!productId) return;
                let cart = getCart();
                const product = cart.find(p => p.id == productId);
                if (product && newQuantity > 0) {
                    product.quantity = newQuantity;
                }
                saveCart(cart);
                renderCartPopup();
                updateCartCount();
            });
        });
    }

    if ($("#cart-table-body").length > 0) {
        
        renderCartPage();

        $('#cart-table-body').on('click', '.remove-btn', function () {
            const cartItem = $(this).closest('tr');
            const productId = cartItem.data('id');
            let cart = getCart();
            cart = cart.filter(p => p.id != productId);
            saveCart(cart);
            renderCartPage();
            updateCartCount();
        });

        $('#cart-table-body').on('change', '.quantity-input', function () {
            const cartItem = $(this).closest('tr');
            const productId = cartItem.data('id');
            const newQuantity = parseInt($(this).val());
            let cart = getCart();
            
            if (newQuantity <= 0) {
                 cart = cart.filter(p => p.id != productId);
            } else {
                 const product = cart.find(p => p.id == productId);
                if (product) {
                    product.quantity = newQuantity;
                }
            }

            saveCart(cart);
            renderCartPage();
            updateCartCount();
        });
    }

    if ($(".checkout-container").length > 0) {
        
        renderCheckoutPage();

        $("#checkout-form").on("submit", function(e) {
            e.preventDefault(); 

            const customerDetails = {
                name: $("#checkout-name").val(),
                phone: $("#checkout-phone").val(),
                address: $("#checkout-address").val(),
                notes: $("#checkout-notes").val(),
                paymentMethod: $("input[name='paymentMethod']:checked").val()
            };
            
            const cart = getCart();
            const total = $("#checkout-total").text();

            console.log("======= طلب جديد =======");
            console.log("بيانات العميل:", customerDetails);
            console.log("المنتجات المطلوبة:", cart);
            console.log("الإجمالي:", total);
            console.log("=======================");

            alert("تم إرسال طلبك بنجاح! سنتصل بك قريباً للتأكيد.");

            saveCart([]);
            updateCartCount();
            window.location.href = "index.html"; 
        });
    }

    $("#collapseCategory").click(function () {
        $("#collapseCategory").toggleClass('open');
        $(".category-list").toggleClass('collapsed');
    });
    $("#collapseBrand").click(function () {
        $("#collapseBrand").toggleClass('open');
        $(".brand-list").toggleClass('collapsed');
    });
    $(".category-item").click(function () {
        $(".category-item").removeClass("active");
        $(this).addClass("active");
        const selectedCategory = $(this).text().trim();
        $(".breadcrumb-active").text(selectedCategory);
    });
    $(".brand-item").click(function () {
        $(".brand-item").removeClass("active");
        $(this).addClass("active");
    });

    const rating = 2.4;
    let fullStars = Math.floor(rating);
    $("#ratingStars span").each(function () {
        if ($(this).data("value") <= fullStars) {
            $(this).addClass("filled");
        }
    });

    $(".add-to-cart-btn").click(function () {
        let cart = getCart();
        const product = {
            id: $(this).data("id"),
            name: $(this).data("name"),
            price: $(this).data("price"),
            image: $(this).data("image"),
            quantity: 1
        };
        const existingProduct = cart.find(p => p.id == product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        updateCartCount();
        showCartPopup();
        renderCartPopup(); 
    });

    if ($('select').length > 0) {
        $('select').niceSelect();
    }

    if ($('.client_owl-carousel').length > 0) {
        $(".client_owl-carousel").owlCarousel({
            loop: true,
            margin: 0,
            dots: false,
            nav: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>'
            ],
            autoplay: true,
            autoplayHoverPause: true,
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                1000: { items: 2 }
            }
        });
    }
});