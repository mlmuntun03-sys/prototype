/* =========================================================
   Segar Teguk — order.js
   Sistem pesanan (logika sama dengan versi asli).
   Satu tambahan kecil: render() mengirim event "order:change"
   supaya efek visual (bar melayang) bisa ikut update.
   ========================================================= */
var WA_NUMBER = "6282120144527"; // NOMOR FIKTIF — ganti dengan nomor asli
var PRICE = 15000, qty = {"Semangka":0,"Melon":0,"Mix Buah":0};
var rp = function(n){return "Rp " + n.toLocaleString("id-ID");};
var wa = document.getElementById("waLink");
var cards = document.querySelectorAll(".item[data-name]");

function render(){
  var total = 0, count = 0, lines = [], list = document.getElementById("orderList");
  list.innerHTML = "";
  cards.forEach(function(c){
    var n = c.dataset.name, q = qty[n];
    c.querySelector("[data-qty]").textContent = q;
    c.classList.toggle("on", q > 0);
    if(q > 0){
      total += q * PRICE; count += q; lines.push(q + " cup " + n);
      var li = document.createElement("li");
      li.innerHTML = "<span>" + q + " &times; " + n + "</span><span>" + rp(q*PRICE) + "</span>";
      list.appendChild(li);
    }
  });
  document.getElementById("orderEmpty").style.display = lines.length ? "none" : "block";
  document.getElementById("orderTotal").textContent = rp(total);
  wa.setAttribute("aria-disabled", lines.length ? "false" : "true");
  wa._lines = lines; wa._total = total;
  document.dispatchEvent(new CustomEvent("order:change", {detail:{count:count, total:total}}));
}
cards.forEach(function(c){
  var n = c.dataset.name;
  c.addEventListener("click", function(e){
    var b = e.target.closest("button");
    if(b){ qty[n] = Math.max(0, qty[n] + (b.dataset.act === "plus" ? 1 : -1)); }
    else if(qty[n] === 0){ qty[n] = 1; }
    render();
  });
  c.addEventListener("keydown", function(e){
    if((e.key === "Enter" || e.key === " ") && e.target === c){ e.preventDefault(); if(qty[n] === 0) qty[n] = 1; render(); }
  });
});
wa.addEventListener("click", function(e){
  e.preventDefault();
  if(!wa._lines || !wa._lines.length){ document.getElementById("menu").scrollIntoView({behavior:"smooth"}); return; }
  var nama = document.getElementById("fNama").value.trim(),
      alamat = document.getElementById("fAlamat").value.trim(),
      cat = document.getElementById("fCatatan").value.trim();
  var msg = "Halo Segar Teguk! Saya mau pesan:\n" + wa._lines.map(function(l){return "- " + l;}).join("\n") +
    "\nTotal: " + rp(wa._total) + (nama ? "\nNama: " + nama : "") + (alamat ? "\nAlamat: " + alamat : "") + (cat ? "\nCatatan: " + cat : "");
  window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
});
document.getElementById("yr").textContent = new Date().getFullYear();
render();
