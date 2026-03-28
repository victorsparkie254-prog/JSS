const STORAGE_KEY = "kakamegaFarmProduceBootstrap";
    const sampleProduce = [
      { name: "Maize", price: 35.00, quantity: 42 },
      { name: "Beans", price: 45.50, quantity: 8 },
      { name: "Bananas", price: 25.20, quantity: 17 },
      { name: "Tomatoes", price: 28.75, quantity: 6 },
      { name: "Potatoes", price: 22.00, quantity: 0 },
      { name: "Avocado", price: 70.00, quantity: 19 },
      { name: "Sukuma Wiki", price: 18.90, quantity: 5 },
   
    ];
    let produceItems = [];

    const gridSection = document.getElementById("gridSection");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const addProduceForm = document.getElementById("addProduceForm");
    const produceName = document.getElementById("produceName");
    const producePrice = document.getElementById("producePrice");
    const produceQty = document.getElementById("produceQty");

    function stockStatus(quantity) {
      if (quantity <= 0) return "Out of Stock";
      if (quantity <= 10) return "Low Stock";
      return "Available";
    }

    function badgeClass(status) {
      if (status === "Available") return "status-available";
      if (status === "Low Stock") return "status-lowstock";
      return "status-outofstock";
    }

    function formatKsh(amount) {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
      }).format(amount).replace("KES", "Dollars");
    }

    function persistProduce() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(produceItems));
    }

    function deleteProduce(produceName) {
      const confirmDelete = confirm(`Are you sure you want to delete ${produceName}?`);
      if (confirmDelete) {
        produceItems = produceItems.filter(item => item.name !== produceName);
        persistProduce();
        renderGrid();
      }
    }

    function loadProduce() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            produceItems = parsed;
            return;
          }
        } catch (err) {
          console.warn("Invalid localStorage data, resetting to sample.");
        }
      }
      produceItems = [...sampleProduce];
      persistProduce();
    }

    function renderGrid() {
      const query = searchInput.value.trim().toLowerCase();
      const selectedStatus = statusFilter.value;
      const filtered = produceItems.filter(item => {
        const matchesText = item.name.toLowerCase().includes(query);
        const itemStatus = stockStatus(Number(item.quantity));
        const matchesStatus = selectedStatus === "All" || itemStatus === selectedStatus;
        return matchesText && matchesStatus;
      });

      gridSection.innerHTML = "";

      if (!filtered.length) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "col-12";
        emptyDiv.innerHTML = `<div class="empty-note text-center">No produce found. Adjust search/filter or add new items.</div>`;
        gridSection.appendChild(emptyDiv);
        return;
      }

      filtered.forEach((item, index) => {
        const status = stockStatus(Number(item.quantity));
        const col = document.createElement("div");
        col.className = "col";
        col.innerHTML = `
          <article class="card card-produce h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h3 class="h6 mb-0">${item.name}</h3>
                <span class="status-badge ${badgeClass(status)}">${status}</span>
              </div>
              <p class="mb-1 text-secondary"><strong>Price:</strong> ${formatKsh(Number(item.price))}</p>
              <p class="mb-0 text-secondary"><strong>Quantity:</strong> ${Number(item.quantity)} unit${Number(item.quantity) === 1 ? "" : "s"}</p>
              <button class="btn btn-sm btn-danger mt-3 w-100 delete-btn" data-produce-name="${item.name}">Delete</button>
            </div>
          </article>`;
        gridSection.appendChild(col);
      });

    
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const produceName = e.target.getAttribute("data-produce-name");
          deleteProduce(produceName);
        });
      });
    }

    addProduceForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = produceName.value.trim();
      const price = parseFloat(producePrice.value);
      const quantity = parseInt(produceQty.value, 10);

      if (!name || Number.isNaN(price) || price < 0 || Number.isNaN(quantity) || quantity < 0) {
        alert("Please enter valid produce name, price, and quantity.");
        return;
      }

      produceItems.unshift({ name, price, quantity });
      persistProduce();
      renderGrid();
      addProduceForm.reset();
      produceName.focus();
    });

    searchInput.addEventListener("input", renderGrid);
    statusFilter.addEventListener("change", renderGrid);

    loadProduce();
    renderGrid();