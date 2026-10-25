
      /* ==========================================
   LIGHT / DARK MODE
========================================== */

      const themeToggle = document.getElementById("themeToggle");

      function updateThemeButton() {
        const dark = document.documentElement.dataset.theme === "dark";

        themeToggle.setAttribute(
          "aria-label",
          dark ? "Switch to light mode" : "Switch to dark mode",
        );

        themeToggle.setAttribute("title", dark ? "Light Mode" : "Dark Mode");

        themeToggle.setAttribute("aria-pressed", String(dark));
      }

      updateThemeButton();

      themeToggle.addEventListener("click", function () {
        const next =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";

        document.documentElement.dataset.theme = next;

        try {
          localStorage.setItem("albertoTheme", next);
        } catch (e) {}

        updateThemeButton();
      });

      /* ==========================================
   READ PRODUCT INFORMATION FROM HTML

   KOI IMAGE URL JAVASCRIPT MEIN NAHI HAI.

   JS HTML CARD KE IMG TAG SE SRC READ KARTA HAI.
========================================== */

      function getProductFromCard(card) {
        const $card = $(card);

        const imageElement = $card.find(".product-image img")[0];

        return {
          id: Number($card.attr("data-id")),

          name: $card.find(".product-info h3").text().trim(),

          category: $card.attr("data-category"),

          price: Number($card.find(".product-price strong").attr("data-price")),

          description: $card.find(".product-description").text().trim(),

          image: imageElement.getAttribute("src"),
        };
      }

      /* ==========================================
   PRICE FORMAT
========================================== */

      function formatPrice(price) {
        return "Rs. " + Number(price).toLocaleString("en-PK");
      }

      /* ==========================================
   CART FUNCTIONS
========================================== */

      function getCart() {
        try {
          const data = JSON.parse(localStorage.getItem("albertoCart") || "[]");

          return Array.isArray(data) ? data : [];
        } catch (e) {
          return [];
        }
      }

      function updateCartCounter() {
        const total = getCart().reduce(
          (sum, item) => sum + (Number(item.quantity) || 1),
          0,
        );

        $("#cartCount").text(total);
      }

      function showToast(message) {
        $("#toastMessage").text(message);

        $("#cartToast").stop(true, true).fadeIn(200).delay(2200).fadeOut(350);
      }

      function addToCart(product, qty = 1) {
        if (!product) return;

        qty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));

        const cart = getCart();

        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
          existing.quantity += qty;

          /* READ CURRENT HTML IMAGE */
          existing.image = product.image;

          existing.price = product.price;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: qty,
          });
        }

        try {
          localStorage.setItem("albertoCart", JSON.stringify(cart));

          updateCartCounter();

          showToast(product.name + " added to cart!");
        } catch (e) {
          showToast("Unable to save cart.");
        }
      }

      /* ==========================================
   MODAL

   IMAGE HTML CARD SE COPY HOTI HAI.
========================================== */

      let selectedProduct = null;

      const modalElement = document.getElementById("productDetailsModal");

      modalElement.addEventListener("show.bs.modal", function (event) {
        const trigger = event.relatedTarget;

        if (!trigger) return;

        const card = trigger.closest(".product-card");

        if (!card) return;

        selectedProduct = getProductFromCard(card);

        const product = selectedProduct;

        $("#modalProductImage").attr({
          src: product.image,

          alt: product.name,
        });

        $("#modalCategory").text(product.category.toUpperCase());

        $("#modalProductTitle").text(product.name);

        $("#modalPrice").text(formatPrice(product.price));

        $("#modalDescription").text(
          product.description +
            " Discover a carefully selected Alberto Clock timepiece designed to complement your personal style and memorable occasions.",
        );

        $("#modalQuantity").val(1);
      });

      modalElement.addEventListener("hidden.bs.modal", function () {
        selectedProduct = null;

        $("#modalProductImage").removeAttr("src");
      });

      $(function () {
        updateCartCounter();
        $("#year").text(new Date().getFullYear());
        $(document).on("click", ".add-to-cart", function () {
          addToCart(getProductFromCard($(this).closest(".product-card")[0]), 1);
        });
        $("#quantityPlus").on("click", function () {
          $("#modalQuantity").val(
            Math.min(99, (Number($("#modalQuantity").val()) || 1) + 1),
          );
        });
        $("#quantityMinus").on("click", function () {
          $("#modalQuantity").val(
            Math.max(1, (Number($("#modalQuantity").val()) || 1) - 1),
          );
        });
        $("#modalQuantity").on("change", function () {
          $(this).val(
            Math.max(1, Math.min(99, Math.floor(Number(this.value) || 1))),
          );
        });
        $("#modalAddCart").on("click", function () {
          if (selectedProduct) {
            addToCart(selectedProduct, $("#modalQuantity").val());
            bootstrap.Modal.getInstance(modalElement)?.hide();
          }
        });
        $("#searchBtn").on("click", function () {
          document.getElementById("shopSearch").focus();
          document
            .getElementById("shopSearch")
            .scrollIntoView({ behavior: "smooth", block: "center" });
        });
        $(window).on("storage", function (e) {
          if (e.originalEvent.key === "albertoCart") updateCartCounter();
          if (e.originalEvent.key === "albertoTheme") {
            let t = e.originalEvent.newValue;
            document.documentElement.dataset.theme =
              t === "dark" ? "dark" : "light";
            updateThemeButton();
          }
        });
        const $items = $(".shop-item"),
          $categories = $(".category-btn"),
          $search = $("#shopSearch"),
          $range = $("#priceRange"),
          $sort = $("#sortBy");
        const prices = $items
          .map(function () {
            return Number($(this).find("[data-price]").attr("data-price"));
          })
          .get();
        const max = Math.ceil(Math.max(...prices) / 5000) * 5000;
        $range.attr({ max: max, min: 0, step: 500, value: max });
        const counts = { all: $items.length };
        $items.each(function () {
          let c = $(this).find(".product-card").attr("data-filter");
          counts[c] = (counts[c] || 0) + 1;
        });
        $("[data-count]").each(function () {
          $(this).text(counts[$(this).attr("data-count")] || 0);
        });
        let category = "all";
        function applyFilters() {
          const q = $search.val().trim().toLowerCase(),
            ceiling = Number($range.val()),
            order = $sort.val();
          $("#priceCurrent").text(formatPrice(ceiling));
          const matches = $items
            .filter(function () {
              const $p = $(this).find(".product-card");
              return (
                (category === "all" || $p.attr("data-filter") === category) &&
                Number($p.find("[data-price]").attr("data-price")) <= ceiling &&
                $p.attr("data-search").includes(q)
              );
            })
            .get();
          matches.sort(function (a, b) {
            const pa = $(a).find(".product-card"),
              pb = $(b).find(".product-card"),
              na = pa.find("h3").text().trim(),
              nb = pb.find("h3").text().trim(),
              aPrice = Number(pa.find("[data-price]").attr("data-price")),
              bPrice = Number(pb.find("[data-price]").attr("data-price"));
            if (order === "price-low") return aPrice - bPrice;
            if (order === "price-high") return bPrice - aPrice;
            if (order === "name") return na.localeCompare(nb);
            return Number(pa.attr("data-id")) - Number(pb.attr("data-id"));
          });
          $items.prop("hidden", true);
          const $grid = $("#shopGrid");
          matches.forEach(function (el) {
            $grid.append(el);
            el.hidden = false;
          });
          $("#resultCount").text(
            matches.length + " of " + $items.length + " watches",
          );
          $("#emptyResults").prop("hidden", matches.length !== 0);
        }
        function chooseCategory(next) {
          category = next;
          $categories.removeClass("active").attr("aria-pressed", "false");
          $categories
            .filter('[data-filter="' + next + '"]')
            .addClass("active")
            .attr("aria-pressed", "true");
          applyFilters();
        }
        $categories.on("click", function () {
          chooseCategory($(this).attr("data-filter"));
          if (window.innerWidth < 992) {
            $("#filterSidebar").removeClass("is-open");
            $("#mobileFilterToggle").attr("aria-expanded", "false");
          }
        });
        $search.on("input", applyFilters);
        $range.on("input change", applyFilters);
        $sort.on("change", applyFilters);
        $("#resetFilters,#emptyReset").on("click", function () {
          $search.val("");
          $range.val(max);
          $sort.val("featured");
          chooseCategory("all");
        });
        $("#mobileFilterToggle").on("click", function () {
          let open = $("#filterSidebar")
            .toggleClass("is-open")
            .hasClass("is-open");
          $(this).attr("aria-expanded", String(open));
        });
        const params = new URLSearchParams(location.search);
        let initial = (params.get("category") || "all").toLowerCase();
        if (initial === "vintage") initial = "classic";
        if (initial === "smart") initial = "all";
        if (!counts[initial] && initial !== "all") initial = "all";
        $search.val(params.get("search") || "");
        chooseCategory(initial);
      });
      
      // Keep page content below the fixed navbar at every breakpoint and
      // when Bootstrap's mobile navigation expands or collapses.
      (() => {
        const header = document.querySelector('.site-header');
        if (!header) return;
        const syncHeaderHeight = () => {
          document.documentElement.style.setProperty(
            '--fixed-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`
          );
        };
        syncHeaderHeight();
        window.addEventListener('load', syncHeaderHeight);
        window.addEventListener('resize', syncHeaderHeight);
        if ('ResizeObserver' in window) {
          new ResizeObserver(syncHeaderHeight).observe(header);
        }
      })();