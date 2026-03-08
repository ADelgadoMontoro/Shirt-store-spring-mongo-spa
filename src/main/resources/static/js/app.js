/* global $ */

const API = {
  usuarios: "/api/usuarios",
  shirts: "/api/shirts",
  orders: "/api/orders"
};

let usuarioEditandoId = null;
let camisetaEditandoId = null;
let usuariosCache = [];
let camisetasCache = [];
let lineasPedidoDraft = [];

/* =========================
   Eventos de formularios
   ========================= */

function wireEvents() {
  $("#formUsuario").on("submit", function (e) {
    e.preventDefault();
    guardarUsuario();
  });

  $("#btnUserCancel").on("click", function () {
    resetFormUsuario();
  });

  $("#formShirt").on("submit", function (e) {
    e.preventDefault();
    guardarCamiseta();
  });

  $("#btnShirtCancel").on("click", function () {
    resetFormCamiseta();
  });

  $("#menu_shirts").on("click", function () {
    cargarCamisetas();
  });

  $("#menu_orders").on("click", function () {
    cargarPedidos();
  });

  $("#btnOrderAddItem").on("click", function () {
    agregarLineaPedido();
  });

  $("#btnOrderReset").on("click", function () {
    resetFormPedido();
  });

  $("#formOrder").on("submit", function (e) {
    e.preventDefault();
    crearPedido();
  });
}

/* =========================
   Alertas y utilidades
   ========================= */

function showAlert(type, msg) {
  $("#alerta")
    .removeClass("d-none alert-success alert-danger alert-warning alert-info")
    .addClass("alert-" + type)
    .text(msg);

  setTimeout(() => $("#alerta").addClass("d-none"), 3000);
}

function parseApiError(xhr, fallbackMsg) {
  const r = xhr.responseJSON;
  if (!r) return fallbackMsg;

  if (Array.isArray(r.details) && r.details.length > 0) {
    return `${r.message}: ${r.details.join(" | ")}`;
  }
  return r.message || fallbackMsg;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* =========================
   Carga inicial
   ========================= */

function cargarTodo() {
  $.when(cargarUsuarios(), cargarCamisetas())
    .done(function () {
      resetFormPedido();
      cargarPedidos();
    })
    .fail(function () {
      showAlert("danger", "Error cargando datos iniciales");
    });
}

/* =========================
   Usuarios
   ========================= */

function cargarUsuarios() {
  return $.getJSON(API.usuarios)
    .done(function (data) {
      usuariosCache = data || [];
      renderUsuarios(data);
      rellenarSelectUsuarios(data);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando usuarios"));
    });
}

function renderUsuarios(usuarios) {
  const rows = (usuarios || []).map(function (u) {
    return `
      <tr>
        <td>${escapeHtml(u.nombre)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.rol || "")}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit-user" data-id="${u.id}">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="del-user" data-id="${u.id}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaUsuarios").html(rows || `<tr><td colspan="4" class="text-center text-muted">Sin datos</td></tr>`);

  $("#tablaUsuarios button[data-action='edit-user']").off("click").on("click", function () {
    const id = $(this).data("id");
    editarUsuario(id);
  });

  $("#tablaUsuarios button[data-action='del-user']").off("click").on("click", function () {
    const id = $(this).data("id");
    eliminarUsuario(id);
  });
}

function rellenarSelectUsuarios(usuarios) {
  const opts = (usuarios || []).map(u =>
    `<option value="${u.id}">${escapeHtml(u.nombre)} (${escapeHtml(u.email)})</option>`
  ).join("");

  $("#ordUsuario").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
}

function guardarUsuario() {
  const payload = {
    nombre: $("#userNombre").val().trim(),
    email: $("#userEmail").val().trim(),
    password: $("#userPassword").val().trim(),
    rol: $("#userRol").val()
  };

  const isEdit = !!usuarioEditandoId;
  const url = isEdit ? `${API.usuarios}/${usuarioEditandoId}` : API.usuarios;
  const method = isEdit ? "PUT" : "POST";

  $.ajax({
    url: url,
    method: method,
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", isEdit ? "Usuario actualizado" : "Usuario creado");
      resetFormUsuario();
      cargarUsuarios();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, isEdit ? "Error actualizando usuario" : "Error creando usuario"));
    });
}

function editarUsuario(id) {
  const u = usuariosCache.find(function (x) { return x.id === id; });
  if (!u) {
    showAlert("danger", "Usuario no encontrado");
    return;
  }

  usuarioEditandoId = u.id;
  $("#userEditId").val(u.id || "");
  $("#userNombre").val(u.nombre || "");
  $("#userEmail").val(u.email || "");
  $("#userPassword").val(u.password || "");
  $("#userRol").val(u.rol || "ADMIN");
  $("#btnUserSave").text("Actualizar");
}

function eliminarUsuario(id) {
  if (!confirm("¿Eliminar el usuario?")) return;

  $.ajax({
    url: `${API.usuarios}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Usuario eliminado");
      if (usuarioEditandoId === id) {
        resetFormUsuario();
      }
      cargarUsuarios();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando usuario"));
    });
}

function resetFormUsuario() {
  usuarioEditandoId = null;
  $("#userEditId").val("");
  $("#formUsuario")[0].reset();
  $("#userRol").val("ADMIN");
  $("#btnUserSave").text("Guardar");
}

/* =========================
   Camisetas
   ========================= */

function cargarCamisetas() {
  return $.getJSON(API.shirts)
    .done(function (data) {
      camisetasCache = data || [];
      renderCamisetas(data);
      rellenarSelectShirtsPedido(data);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando camisetas"));
    });
}

function rellenarSelectShirtsPedido(camisetas) {
  const opts = (camisetas || []).map(function (s) {
    const label = `${s.nombre || ""} | ${s.size || ""} | ${s.price || 0} EUR`;
    return `<option value="${s.id}">${escapeHtml(label)}</option>`;
  }).join("");

  $("#ordShirt").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
}

function renderCamisetas(camisetas) {
  const rows = (camisetas || []).map(function (s) {
    return `
      <tr>
        <td>${escapeHtml(s.nombre)}</td>
        <td>${escapeHtml(s.size)}</td>
        <td>${escapeHtml(s.gender)}</td>
        <td>${escapeHtml(s.color)}</td>
        <td>${escapeHtml(s.brand)}</td>
        <td>${escapeHtml(s.stock)}</td>
        <td>${escapeHtml(s.price)}</td>
        <td>${s.active ? "Sí" : "No"}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit-shirt" data-id="${s.id}">
            Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="del-shirt" data-id="${s.id}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaShirts").html(rows || `<tr><td colspan="9" class="text-center text-muted">Sin datos</td></tr>`);

  $("#tablaShirts button[data-action='edit-shirt']").off("click").on("click", function () {
    const id = $(this).data("id");
    editarCamiseta(id);
  });

  $("#tablaShirts button[data-action='del-shirt']").off("click").on("click", function () {
    const id = $(this).data("id");
    eliminarCamiseta(id);
  });
}

function guardarCamiseta() {
  const payload = {
    nombre: $("#shirtNombre").val().trim(),
    size: $("#shirtSize").val(),
    gender: $("#shirtGender").val(),
    color: $("#shirtColor").val().trim(),
    brand: $("#shirtBrand").val().trim(),
    stock: Number($("#shirtStock").val()),
    price: Number($("#shirtPrice").val()),
    active: $("#shirtActive").is(":checked")
  };

  const isEdit = !!camisetaEditandoId;
  const url = isEdit ? `${API.shirts}/${camisetaEditandoId}` : API.shirts;
  const method = isEdit ? "PUT" : "POST";

  $.ajax({
    url: url,
    method: method,
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", isEdit ? "Camiseta actualizada" : "Camiseta creada");
      resetFormCamiseta();
      cargarCamisetas();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, isEdit ? "Error actualizando camiseta" : "Error creando camiseta"));
    });
}

function editarCamiseta(id) {
  $.getJSON(`${API.shirts}/${id}`)
    .done(function (s) {
      camisetaEditandoId = s.id;
      $("#shirtEditId").val(s.id || "");
      $("#shirtNombre").val(s.nombre || "");
      $("#shirtSize").val(s.size || "");
      $("#shirtGender").val(s.gender || "");
      $("#shirtColor").val(s.color || "");
      $("#shirtBrand").val(s.brand || "");
      $("#shirtStock").val(s.stock !== undefined && s.stock !== null ? s.stock : 0);
      $("#shirtPrice").val(s.price !== undefined && s.price !== null ? s.price : 0);
      $("#shirtActive").prop("checked", !!s.active);
      $("#btnShirtSave").text("Actualizar");
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando camiseta"));
    });
}

function eliminarCamiseta(id) {
  if (!confirm("¿Eliminar la camiseta?")) return;

  $.ajax({
    url: `${API.shirts}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Camiseta eliminada");
      if (camisetaEditandoId === id) {
        resetFormCamiseta();
      }
      cargarCamisetas();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando camiseta"));
    });
}

function resetFormCamiseta() {
  camisetaEditandoId = null;
  $("#shirtEditId").val("");
  $("#formShirt")[0].reset();
  $("#shirtActive").prop("checked", true);
  $("#btnShirtSave").text("Guardar");
}

/* =========================
   Pedidos
   ========================= */

function cargarPedidos() {
  return $.getJSON(API.orders)
    .done(function (data) {
      renderPedidos(data);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando pedidos"));
    });
}

function agregarLineaPedido() {
  const shirtId = $("#ordShirt").val();
  const qty = Number($("#ordQty").val() || 0);

  if (!shirtId) {
    showAlert("warning", "Seleccione una camiseta");
    return;
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    showAlert("warning", "La cantidad debe ser un entero mayor que 0");
    return;
  }

  const shirt = camisetasCache.find(s => s.id === shirtId);
  if (!shirt) {
    showAlert("danger", "Camiseta no encontrada en catálogo");
    return;
  }

  const existente = lineasPedidoDraft.find(i => i.shirtId === shirtId);
  if (existente) {
    existente.quantity += qty;
  } else {
    lineasPedidoDraft.push({
      shirtId: shirt.id,
      nombre: shirt.nombre,
      size: shirt.size,
      unitPrice: Number(shirt.price),
      quantity: qty
    });
  }

  renderLineasPedidoDraft();
}

function renderLineasPedidoDraft() {
  const rows = lineasPedidoDraft.map(function (it, idx) {
    const subtotal = Number(it.unitPrice) * Number(it.quantity);
    return `
      <tr>
        <td>${escapeHtml(it.nombre)}</td>
        <td>${escapeHtml(it.size)}</td>
        <td>${escapeHtml(Number(it.unitPrice).toFixed(2))}</td>
        <td>${escapeHtml(it.quantity)}</td>
        <td>${escapeHtml(subtotal.toFixed(2))}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="del-order-item" data-idx="${idx}">
            Quitar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaOrderItemsDraft").html(rows || `<tr><td colspan="6" class="text-center text-muted">Sin líneas</td></tr>`);

  $("#tablaOrderItemsDraft button[data-action='del-order-item']").off("click").on("click", function () {
    const idx = Number($(this).data("idx"));
    lineasPedidoDraft.splice(idx, 1);
    renderLineasPedidoDraft();
  });

  const total = lineasPedidoDraft.reduce((acc, it) => acc + (Number(it.unitPrice) * Number(it.quantity)), 0);
  $("#ordTotal").val(total.toFixed(2));
}

function crearPedido() {
  const userId = $("#ordUsuario").val();
  if (!userId) {
    showAlert("warning", "Seleccione un usuario");
    return;
  }
  if (!lineasPedidoDraft.length) {
    showAlert("warning", "Añada al menos una línea al pedido");
    return;
  }

  const user = usuariosCache.find(u => u.id === userId);
  if (!user) {
    showAlert("danger", "Usuario no encontrado");
    return;
  }

  const total = lineasPedidoDraft.reduce((acc, it) => acc + (Number(it.unitPrice) * Number(it.quantity)), 0);

  const payload = {
    createdAt: new Date().toISOString(),
    user: {
      userId: user.id,
      nombre: user.nombre,
      email: user.email
    },
    items: lineasPedidoDraft.map(function (it) {
      return {
        shirtId: it.shirtId,
        nombre: it.nombre,
        size: it.size,
        unitPrice: Number(it.unitPrice),
        quantity: Number(it.quantity)
      };
    }),
    total: Number(total.toFixed(2))
  };

  $.ajax({
    url: API.orders,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", "Pedido creado");
      resetFormPedido();
      cargarPedidos();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error creando pedido"));
    });
}

function renderPedidos(pedidos) {
  const rows = (pedidos || []).map(function (o) {
    const fecha = o.createdAt ? String(o.createdAt).replace("T", " ").slice(0, 19) : "";
    const usuario = o.user ? `${o.user.nombre || ""} (${o.user.email || ""})` : "";
    const nItems = Array.isArray(o.items) ? o.items.length : 0;
    const total = o.total !== undefined && o.total !== null ? Number(o.total).toFixed(2) : "0.00";

    return `
      <tr>
        <td>${escapeHtml(fecha)}</td>
        <td>${escapeHtml(usuario)}</td>
        <td>${escapeHtml(nItems)}</td>
        <td>${escapeHtml(total)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="detail-order" data-id="${o.id}">
            Detalle
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="del-order" data-id="${o.id}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaOrders").html(rows || `<tr><td colspan="5" class="text-center text-muted">Sin pedidos</td></tr>`);

  $("#tablaOrders button[data-action='detail-order']").off("click").on("click", function () {
    const id = $(this).data("id");
    verDetallePedido(id);
  });

  $("#tablaOrders button[data-action='del-order']").off("click").on("click", function () {
    const id = $(this).data("id");
    eliminarPedido(id);
  });
}

function verDetallePedido(id) {
  $.getJSON(`${API.orders}/${id}`)
    .done(function (o) {
      const fecha = o.createdAt ? String(o.createdAt).replace("T", " ").slice(0, 19) : "";
      const usuario = o.user ? `${o.user.nombre || ""} (${o.user.email || ""})` : "";
      const total = o.total !== undefined && o.total !== null ? Number(o.total).toFixed(2) : "0.00";

      $("#orderDetailHeader").text(`Pedido ${o.id || ""} | ${fecha} | ${usuario} | Total: ${total} EUR`);

      const rows = (o.items || []).map(function (it) {
        const subtotal = Number(it.unitPrice) * Number(it.quantity);
        return `
          <tr>
            <td>${escapeHtml(it.nombre)}</td>
            <td>${escapeHtml(it.size)}</td>
            <td>${escapeHtml(Number(it.unitPrice).toFixed(2))}</td>
            <td>${escapeHtml(it.quantity)}</td>
            <td>${escapeHtml(subtotal.toFixed(2))}</td>
          </tr>
        `;
      }).join("");

      $("#tablaOrderDetailItems").html(rows || `<tr><td colspan="5" class="text-center text-muted">Sin líneas</td></tr>`);
      $("#orderDetailPanel").removeClass("d-none");
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando detalle del pedido"));
    });
}

function eliminarPedido(id) {
  if (!confirm("¿Eliminar el pedido?")) return;

  $.ajax({
    url: `${API.orders}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Pedido eliminado");
      cargarPedidos();
      $("#orderDetailPanel").addClass("d-none");
      $("#tablaOrderDetailItems").empty();
      $("#orderDetailHeader").empty();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando pedido"));
    });
}

function resetFormPedido() {
  lineasPedidoDraft = [];
  $("#formOrder")[0].reset();
  $("#ordQty").val(1);
  $("#ordTotal").val("0.00");
  renderLineasPedidoDraft();
}
