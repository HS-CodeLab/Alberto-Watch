
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

      /* ==========================================
   DOCUMENT READY
========================================== */

      $(function () {
        updateCartCounter();

        $("#year").text(new Date().getFullYear());

        /* ADD TO CART FROM HTML PRODUCT CARD */

        $(".add-to-cart").on("click", function () {
          const card = $(this).closest(".product-card")[0];

          const product = getProductFromCard(card);

          addToCart(product, 1);
        });

        /* QUANTITY PLUS */

        $("#quantityPlus").on("click", function () {
          const n = Number($("#modalQuantity").val()) || 1;

          $("#modalQuantity").val(Math.min(99, n + 1));
        });

        /* QUANTITY MINUS */

        $("#quantityMinus").on("click", function () {
          const n = Number($("#modalQuantity").val()) || 1;

          $("#modalQuantity").val(Math.max(1, n - 1));
        });

        /* QUANTITY VALIDATION */

        $("#modalQuantity").on("change", function () {
          const n = Math.floor(Number($(this).val()));

          $(this).val(Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : 1);
        });

        /* ADD TO CART FROM MODAL */

        $("#modalAddCart").on("click", function () {
          if (!selectedProduct) return;

          addToCart(selectedProduct, $("#modalQuantity").val());

          bootstrap.Modal.getInstance(modalElement)?.hide();
        });

        /* ORDER SELECTED WATCH ON WHATSAPP */
        $("#modalWhatsappOrder").on("click", function () {
          if (!selectedProduct) return;
          const quantity = Math.max(
            1,
            Math.min(99, Math.floor(Number($("#modalQuantity").val()) || 1)),
          );
          const message = [
            "Hello Alberto Clock, I would like to order this watch:",
            "Product: " + selectedProduct.name,
            "Category: " + selectedProduct.category,
            "Unit price: " + formatPrice(selectedProduct.price),
            "Quantity: " + quantity,
            "Total: " + formatPrice(selectedProduct.price * quantity),
            "Product image: " + selectedProduct.image,
            "Please confirm availability and delivery details.",
          ].join("\n");
          window.open(
            "https://wa.me/923102226984?text=" + encodeURIComponent(message),
            "_blank",
            "noopener,noreferrer",
          );
        });

        /* SEARCH */

        $("#searchBtn").on("click", function () {
          const query = prompt("Search Alberto Watches");

          if (query && query.trim()) {
            location.href =
              "shop.html?search=" + encodeURIComponent(query.trim());
          }
        });

        /* NEWSLETTER DEMO */

        $("#newsletterForm").on("submit", function (e) {
          e.preventDefault();

          $("#newsletterMessage").text(
            "Thank you! Newsletter registration is currently a demo.",
          );

          this.reset();
        });

        /* ==========================================
       ANIMATED COUNTERS
    ========================================== */

        let counterStarted = false;

        const observer = new IntersectionObserver(
          (entries) => {
            if (
              counterStarted ||
              !entries.some((entry) => entry.isIntersecting)
            ) {
              return;
            }

            counterStarted = true;

            $(".counter").each(function () {
              const element = $(this);

              const target = Number(element.data("target"));

              $({ value: 0 }).animate(
                { value: target },

                {
                  duration: 2000,

                  easing: "swing",

                  step: function () {
                    element.text(
                      Math.floor(this.value).toLocaleString("en-PK"),
                    );
                  },

                  complete: function () {
                    element.text(target.toLocaleString("en-PK"));
                  },
                },
              );
            });

            observer.disconnect();
          },
          {
            threshold: 0.2,
          },
        );

        const counterSection = document.getElementById("counter");
        if (counterSection) observer.observe(counterSection);

        /* ==========================================
       SMOOTH SCROLL
    ========================================== */

        $('a[href^="#"]').on("click", function (e) {
          const href = this.getAttribute("href");

          if (!href || href === "#") return;

          const target = $(href);

          if (target.length) {
            e.preventDefault();

            $("html,body").animate(
              {
                scrollTop:
                  target.offset().top -
                  (parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue(
                      "--fixed-header-height",
                    ),
                  ) || 0) -
                  15,
              },
              650,
            );
          }
        });
      });
      /* Keep the page offset equal to the real fixed header height, including expanded mobile menu. */
      (function () {
        const shell = document.getElementById("fixedHeaderShell");
        if (!shell) return;
        function syncHeaderHeight() {
          document.documentElement.style.setProperty(
            "--fixed-header-height",
            shell.getBoundingClientRect().height + "px",
          );
        }
        syncHeaderHeight();
        window.addEventListener("load", syncHeaderHeight);
        window.addEventListener("resize", syncHeaderHeight);
        if ("ResizeObserver" in window)
          new ResizeObserver(syncHeaderHeight).observe(shell);
        shell.addEventListener("shown.bs.collapse", syncHeaderHeight);
        shell.addEventListener("hidden.bs.collapse", syncHeaderHeight);
      })();

      /* Single shared filter for all ten four-card collections. */
      (() => {
        const sections = [...document.querySelectorAll(".collection-edit")];
        const bar = document.querySelector("#globalFilters");
        if (!bar) return;
        const category = document.querySelector("#globalCategory"),
          sort = document.querySelector("#globalSort"),
          count = document.querySelector("#globalCount");
        const reset = document.querySelector("#resetFilters");
        let mode = "all";
        const entries = sections.map((section) => ({
          section,
          grid: section.querySelector(".edit-grid"),
          items: [...section.querySelector(".edit-grid").children],
        }));
        function refresh() {
          let total = 0;
          entries.forEach(({ section, grid, items }) => {
            let visible = 0;
            items.forEach((item) => {
              const card = item.querySelector(".product-card"),
                price = Number(card.dataset.priceValue),
                order = Number(card.dataset.order);
              const matches =
                category.value === "all" || section.id === category.value;
              const passes =
                mode === "all" ||
                (mode === "new" && order === 0) ||
                (mode === "featured" && card.dataset.featured === "true") ||
                (mode === "under" && price < 25000);
              item.hidden = !(matches && passes);
              if (!item.hidden) visible++;
            });
            const ordered = [...items].sort((a, b) => {
              const x = a.querySelector(".product-card"),
                y = b.querySelector(".product-card");
              switch (sort.value) {
                case "low":
                  return (
                    Number(x.dataset.priceValue) - Number(y.dataset.priceValue)
                  );
                case "high":
                  return (
                    Number(y.dataset.priceValue) - Number(x.dataset.priceValue)
                  );
                case "az":
                  return x
                    .querySelector("h3")
                    .textContent.localeCompare(
                      y.querySelector("h3").textContent,
                    );
                default:
                  return Number(x.dataset.order) - Number(y.dataset.order);
              }
            });
            ordered.forEach((item) => grid.appendChild(item));
            section.hidden = visible === 0;
            total += visible;
          });
          count.textContent = total + " " + (total === 1 ? "PIECE" : "PIECES");
        }
        bar.querySelectorAll(".filter-option").forEach((btn) =>
          btn.addEventListener("click", () => {
            mode = btn.dataset.mode;
            bar.querySelectorAll(".filter-option").forEach((b) => {
              const active = b === btn;
              b.classList.toggle("active", active);
              b.setAttribute("aria-pressed", String(active));
            });
            refresh();
          }),
        );
        category.addEventListener("change", refresh);
        sort.addEventListener("change", refresh);
        reset.addEventListener("click", () => {
          category.value = "all";
          sort.value = "default";
          bar.querySelector('[data-mode="all"]').click();
        });
        refresh();
      })();