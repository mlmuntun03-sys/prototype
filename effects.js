/* =========================================================
   Segar Teguk — effects.js
   Efek visual & interaksi UI saja (tidak menyentuh logika pesanan).
   ========================================================= */
(function(){
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var header = document.getElementById("siteHeader");

  /* header: bayangan saat scroll */
  function onScroll(){ header.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* menu mobile */
  var menuBtn = document.getElementById("menuBtn");
  function setMenu(open){
    header.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    menuBtn.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
  }
  menuBtn.addEventListener("click", function(){ setMenu(!header.classList.contains("open")); });
  document.querySelectorAll(".nav-links a").forEach(function(a){
    a.addEventListener("click", function(){ setMenu(false); });
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") setMenu(false); });

  /* tema terang / gelap */
  var themeBtn = document.getElementById("themeBtn");
  function currentTheme(){
    return root.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function paintTheme(){
    themeBtn.querySelector("use").setAttribute("href", currentTheme() === "dark" ? "#i-sun" : "#i-moon");
  }
  themeBtn.addEventListener("click", function(){
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("sp-theme", next); } catch(e) {}
    paintTheme();
  });
  paintTheme();

  /* reveal saat scroll */
  var items = document.querySelectorAll(".reveal");
  if(reduce || !("IntersectionObserver" in window)){
    items.forEach(function(i){ i.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:"0px 0px -6% 0px"});
    items.forEach(function(i){ io.observe(i); });
  }

  /* menu aktif sesuai posisi scroll */
  var links = [].slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var linkById = {};
  links.forEach(function(l){ linkById[l.getAttribute("href").slice(1)] = l; });
  if("IntersectionObserver" in window){
    var so = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && linkById[e.target.id]){
          links.forEach(function(l){ l.classList.remove("active"); });
          linkById[e.target.id].classList.add("active");
        }
      });
    }, {rootMargin:"-45% 0px -50% 0px"});
    Object.keys(linkById).forEach(function(id){
      var s = document.getElementById(id); if(s) so.observe(s);
    });
  }

  /* parallax lembut di hero (mouse) */
  var stage = document.querySelector("[data-parallax]");
  if(stage && !reduce && canHover){
    var layers = stage.querySelectorAll("[data-depth]");
    stage.addEventListener("pointermove", function(e){
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function(l){
        var d = parseFloat(l.dataset.depth);
        l.style.translate = (x * d) + "px " + (y * d) + "px";
      });
    });
    stage.addEventListener("pointerleave", function(){
      layers.forEach(function(l){ l.style.translate = ""; });
    });
  }

  /* tilt 3D ilustrasi kartu menu */
  if(!reduce && canHover){
    document.querySelectorAll(".item").forEach(function(c){
      c.addEventListener("pointermove", function(e){
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty("--ry", (x * 12) + "deg");
        c.style.setProperty("--rx", (-y * 12) + "deg");
      });
      c.addEventListener("pointerleave", function(){
        c.style.removeProperty("--rx");
        c.style.removeProperty("--ry");
      });
    });
  }

  /* bar pesanan melayang + animasi angka */
  var bar = document.getElementById("cartBar");
  var barCount = document.getElementById("cartCount");
  var barTotal = document.getElementById("cartTotal");
  var hasItems = false, orderInView = false;

  function paintBar(){ bar.classList.toggle("show", hasItems && !orderInView); }

  document.addEventListener("order:change", function(e){
    var d = e.detail;
    hasItems = d.count > 0;
    barCount.textContent = d.count + " cup";
    barTotal.textContent = "Rp " + d.total.toLocaleString("id-ID");
    document.querySelectorAll("[data-qty]").forEach(function(o){
      if(o.dataset.prev !== undefined && o.dataset.prev !== o.textContent && !reduce){
        o.classList.remove("bump"); void o.offsetWidth; o.classList.add("bump");
      }
      o.dataset.prev = o.textContent;
    });
    paintBar();
  });

  var orderSec = document.getElementById("pesan");
  if(orderSec && "IntersectionObserver" in window){
    new IntersectionObserver(function(entries){
      orderInView = entries[0].isIntersecting;
      paintBar();
    }, {threshold:.25}).observe(orderSec);
  }
})();
