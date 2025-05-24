window.addEventListener("message", function(event) {
  // Modificar productos de menu1 o menu2
  if (event.data && event.data.tipo === "modificar-productos") {
    const { menu, productos } = event.data;
    let grid, section;
    if (menu === "menu1") {
      section = document.querySelector(".menu1");
      grid = section?.querySelector(".menu1-grid");
    } else if (menu === "menu2") {
      section = document.querySelector(".menu2");
      grid = section?.querySelector(".menu2-grid");
    }
    if (!grid) return;
    grid.innerHTML = "";
    productos.forEach(prod => {
      const div = document.createElement("div");
      div.className = "item";
      if (prod.destacado) {
        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = "Más vendido";
        div.appendChild(badge);
      }
      const img = document.createElement("div");
      img.className = "img";
      if (prod.imagen) img.style.backgroundImage = `url('${prod.imagen}')`;
      div.appendChild(img);
      const p = document.createElement("p");
      p.innerHTML = `${prod.nombre}<br />$${prod.precio}`;
      div.appendChild(p);
      if (menu === "menu2" && prod.opciones && prod.opciones.length > 0) {
        const select = document.createElement("select");
        prod.opciones.forEach(op => {
          const option = document.createElement("option");
          option.textContent = op;
          select.appendChild(option);
        });
        div.appendChild(select);
      }
      grid.appendChild(div);
    });
  }

  // Modificar promociones
  if (event.data && event.data.tipo === "modificar-promos") {
    const promos = event.data.promos;
    const grid = document.querySelector(".promo-grid");
    if (!grid) return;
    grid.innerHTML = "";
    promos.forEach(promo => {
      const card = document.createElement("div");
      card.className = "promo-card";
      const imgDiv = document.createElement("div");
      imgDiv.className = "promo-img";
      if (promo.imagen) imgDiv.style.backgroundImage = `url('${promo.imagen}')`;
      card.appendChild(imgDiv);
      const infoDiv = document.createElement("div");
      const h4 = document.createElement("h4");
      h4.textContent = promo.titulo;
      const p = document.createElement("p");
      p.textContent = promo.descripcion;
      infoDiv.appendChild(h4);
      infoDiv.appendChild(p);
      card.appendChild(infoDiv);
      grid.appendChild(card);
    });
  }

  // Responder con productos actuales al editor
  if (event.data && event.data.tipo === "pedir-productos") {
    const menu = event.data.menu;
    let grid;
    if (menu === "menu1") {
      grid = document.querySelector(".menu1-grid");
    } else if (menu === "menu2") {
      grid = document.querySelector(".menu2-grid");
    }
    if (!grid) return;
    const items = Array.from(grid.children);
    const productos = items.map(item => {
      const nombrePrecio = item.querySelector("p")?.innerHTML.split(/<br\s*\/?>/) || ["", ""];
      const nombre = nombrePrecio[0].trim();
      const precio = nombrePrecio[1]?.replace("$", "").trim() || "";
      const destacado = !!item.querySelector(".badge");
      const imgDiv = item.querySelector(".img");
      let imagen = "";
      if (imgDiv && imgDiv.style.backgroundImage) {
        imagen = imgDiv.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      }
      let opciones = [];
      const select = item.querySelector("select");
      if (select) {
        opciones = Array.from(select.options).map(opt => opt.textContent);
      }
      return { nombre, precio, imagen, destacado, opciones };
    });
    event.source.postMessage({ tipo: "productos-actuales", productos }, event.origin);
  }

  // Responder con promociones actuales al editor
  if (event.data && event.data.tipo === "pedir-promos") {
    const grid = document.querySelector(".promo-grid");
    if (!grid) return;
    const items = Array.from(grid.children);
    const promos = items.map(item => {
      const titulo = item.querySelector("h4")?.textContent || "";
      const descripcion = item.querySelector("p")?.textContent || "";
      let imagen = "";
      const imgDiv = item.querySelector(".promo-img");
      if (imgDiv && imgDiv.style.backgroundImage) {
        imagen = imgDiv.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      }
      return { titulo, descripcion, imagen };
    });
    event.source.postMessage({ tipo: "promos-actuales", promos }, event.origin);
  }
});
