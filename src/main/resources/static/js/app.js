/* global $ */

const API = {
  instalaciones: "/api/instalaciones",
  usuarios: "/api/usuarios",
  reservas: "/api/reservas",
  horarios: "/api/horarios", //antes faltaba la barra inicial y petaba la ruta
  shirts: "/api/shirts",
  orders: "/api/orders"
};

let horariosReservar = [];
let camisetaEditandoId = null;
let usuarioEditandoId = null;
let usuariosCache = [];
let camisetasCache = [];
let lineasPedidoDraft = [];
let pedidosCache = [];


/* =========================
   Eventos de formularios
   ========================= */

function wireEvents() {
  $("#formInstalacion").on("submit", function (e) {
    e.preventDefault();
    crearInstalacion();
  });

  $("#formUsuario").on("submit", function (e) {
    e.preventDefault();
    guardarUsuario();
  });

  $("#formHorario").on("submit", function (e) {
    e.preventDefault();
    crearHorario();
  });

  $("#formReserva").on("submit", function (e) {
    e.preventDefault();
    crearReserva();
  });

  $("#menu_horarios").on("click", function (e) {
    cargarHorarios();
  });

  $("#menu_shirts").on("click", function () {
    cargarCamisetas();
  });

  $("#menu_orders").on("click", function () {
    cargarPedidos();
  });

  $("#formShirt").on("submit", function (e) {
    e.preventDefault();
    guardarCamiseta();
  });

  $("#btnShirtCancel").on("click", function () {
    resetFormCamiseta();
  });

  $("#btnUserCancel").on("click", function () {
    resetFormUsuario();
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
  $.when(cargarInstalaciones(), cargarUsuarios(), cargarHorarios(), cargarCamisetas())
    .done(function () {
      cargarReservas();
      resetFormPedido();
      cargarPedidos();
    })
    .fail(function () {
      showAlert("danger", "Error cargando datos iniciales");
    });
}

/* =========================
   Instalaciones
   ========================= */

function cargarInstalaciones() {
  return $.getJSON(API.instalaciones)
    .done(function (data) {
      renderInstalaciones(data);
      rellenarSelectInstalaciones(data);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando instalaciones"));
    });
}

function renderInstalaciones(instalaciones) {
  const rows = (instalaciones || []).map(function (i) {
    return `
      <tr>
        <td>${escapeHtml(i.nombre)}</td>
        <td>${escapeHtml(i.direccion)}</td>
        <td>${escapeHtml(i.ciudad)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="del-inst" data-id="${i.id}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaInstalaciones").html(rows || `<tr><td colspan="4" class="text-center text-muted">Sin datos</td></tr>`);

  // Delegación de eventos para botones generados dinámicamente
  $("#tablaInstalaciones button[data-action='del-inst']").off("click").on("click", function () {
    const id = $(this).data("id");
    eliminarInstalacion(id);
  });
}

function rellenarSelectInstalaciones(instalaciones) {
  const opts = (instalaciones || []).map(i =>
    `<option value="${i.id}">${escapeHtml(i.nombre)} (${escapeHtml(i.ciudad)})</option>`
  ).join("");

  // Selects: filtros y alta
  $("#filtroInstalacion").html(`<option value="">Todas</option>${opts}`);
  $("#resInstalacion").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
  $("#horInstalacion").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
}

function crearInstalacion() {
  const payload = {
    id: $("#instID").val().trim(),
    nombre: $("#instNombre").val().trim(),
    direccion: $("#instDireccion").val().trim(),
    ciudad: $("#instCiudad").val().trim()
  };

  $.ajax({
    url: API.instalaciones,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", "Instalación creada");
      $("#formInstalacion")[0].reset();
      cargarInstalaciones();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error creando instalación"));
    });
}

/* =========================
   horarios
   ========================= */


function cargarHorarios() {
  console.log("recargando horarios...")
  return $.getJSON(API.horarios)
    .done(function (data) {
      horariosReservar = data || [];
      $('#tablaHorarios').empty();
      console.log(data);      
      $('#tablaHorarios').append(
        (data || []).map(function (horario) {
          return `
            <tr>
              <td>${escapeHtml(horario.instalacion.nombre)}</td>
              <td>${escapeHtml(horario.horaInicio)}</td>
              <td>${escapeHtml(horario.horaFin)}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" data-action="del-inst" data-id="${horario.id}">
                  Eliminar
                </button>
              </td>
            </tr>
          `})
      );
      // Delegación de eventos para botones generados dinámicamente
      $("#tablaHorarios button[data-action='del-inst']").off("click").on("click", function () {
        const id = $(this).data("id");
        eliminarHorario(id);
      });

      rellenarSelectHorarios(horariosReservar);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando horarios"));
    });
}

function rellenarSelectHorarios(horarios) {
  const opts = (horarios || []).map(function (h) {
    const inst = h.instalacion || {};
    const label = `${inst.nombre || "Instalación"} (${h.horaInicio || ""} - ${h.horaFin || ""})`;
    return `<option value="${h.id}">${escapeHtml(label)}</option>`;
  }).join("");

  $("#resHorario").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
}

function crearHorario() {
  const payload = {
    //id: $("#instID").val().trim(),
    instalacion: { id: $("#horInstalacion").val() }, //el back espera un objeto instalación, no solo el id sin mas ahora
    horaInicio: $("#horHoraInicio").val(),
    horaFin: $("#horHoraFin").val(),
  };

  $.ajax({
    url: API.horarios,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", "Horario creado");
      $("#formHorario")[0].reset();
      cargarHorarios();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error creando horario"));
    });
}




function eliminarHorario(id) {
  if (!confirm("¿Eliminar el horario?")) return;

  $.ajax({
    url: `${API.horarios}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Horario eliminado");
      cargarHorarios();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando Horario"));
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

  $("#filtroUsuario").html(`<option value="">Todos</option>${opts}`);
  $("#resUsuario").html(`<option value="" disabled selected>Seleccione...</option>${opts}`);
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
  $.getJSON(API.usuarios)
    .done(function (data) {
      const u = (data || []).find(function (x) { return x.id === id; });
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
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando usuario"));
    });
}

function eliminarUsuario(id) {
  if (!confirm("¿Eliminar el usuario?")) return;

  $.ajax({
    url: `${API.usuarios}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Usuario eliminado");
      cargarUsuarios();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando usuario"));
    });
}

/* =========================
   Reservas
   ========================= */

function cargarReservas() {
  return $.getJSON(API.reservas)
    .done(function (data) {
      renderReservas(data);
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error cargando reservas"));
    });
}

function crearReserva() {
  const horarioId = $("#resHorario").val();
  const horario = horariosReservar.find(h => h.id === horarioId); //preguntar esto puede fallar si h.id es int y horarioId string?
  const dia = $("#resDia").val();
  const fechaReserva = dia ? `${dia}T00:00:00Z` : null;

  const payload = {
    usuarioId: $("#resUsuario").val(),
    fechaReserva, //antes mandaba dia suelto
    horario
  };

  $.ajax({
    url: API.reservas,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function () {
      showAlert("success", "Reserva creada");
      $("#formReserva")[0].reset();
      cargarReservas();
    })
    .fail(function (xhr) {
      // 409 típico por solape, 400 por validación, 404 por usuario/instalación inexistente
      showAlert("danger", parseApiError(xhr, "Error creando reserva"));
    });
}

function eliminarReserva(id) {
  if (!confirm("¿Eliminar la reserva?")) return;

  $.ajax({
    url: `${API.reservas}/${id}`,
    method: "DELETE"
  })
    .done(function () {
      showAlert("success", "Reserva eliminada");
      cargarReservas();
    })
    .fail(function (xhr) {
      showAlert("danger", parseApiError(xhr, "Error eliminando reserva"));
    });
}

function renderReservas(reservas) {
  const usuariosMap = construirUsuariosMap();
  const rows = (reservas || []).map(function (r) {
    const h = r.horario || {};
    const inst = h.instalacion || {};
    const usuarioNombre = usuariosMap.get(r.usuarioId) || r.usuarioId;

    const dia = r.fechaReserva ? String(r.fechaReserva).slice(0, 10) : "";
    const tramo = `${h.horaInicio || ""} - ${h.horaFin || ""}`;
    const instalacion = inst.nombre ? `${inst.nombre} (${inst.ciudad || ""})` : (inst.id || "");

    return `
      <tr>
        <td>${escapeHtml(dia)}</td>
        <td>${escapeHtml(tramo)}</td>
        <td>${escapeHtml(instalacion)}</td>
        <td>${escapeHtml(usuarioNombre)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="del-res" data-id="${r.id}">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#tablaReservas").html(rows || `<tr><td colspan="5" class="text-center text-muted">Sin datos</td></tr>`);

  $("#tablaReservas button[data-action='del-res']").off("click").on("click", function () {
    const id = $(this).data("id");
    eliminarReserva(id);
  });
}

/* =========================
   Mapas auxiliares
   ========================= */

function construirUsuariosMap() {
  // Construye un mapa id -> nombre leyendo la tabla ya cargada.
  // Alternativa: guardar el último listado en una variable global.
  const map = new Map();

  // Se intenta construir desde el select de reservas (que contiene nombre + email).
  $("#resUsuario option").each(function () {
    const val = $(this).attr("value");
    const txt = $(this).text();
    if (val) map.set(val, txt);
  });

  return map;
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

function resetFormUsuario() {
  usuarioEditandoId = null;
  $("#userEditId").val("");
  $("#formUsuario")[0].reset();
  $("#userRol").val("ADMIN");
  $("#btnUserSave").text("Guardar");
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
      pedidosCache = data || [];
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
