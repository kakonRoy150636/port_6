/* ==========================================================================
   YOUR NAME — Premium Portfolio Template · Vanilla JS + GSAP
   ========================================================================== */
(function () {
  "use strict";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------------------------------------------------------------
     PAGE LOADER + entrance
  --------------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const loaderBar = loader.querySelector(".loader__bar span");
  document.body.classList.add("is-loading");

  window.addEventListener("load", () => {
    if (!gsap) return finishLoader();
    const tl = gsap.timeline();
    tl.to(loaderBar, { width: "100%", duration: 1.1, ease: "power2.out" })
      .to(loader, { opacity: 0, duration: 0.5, onComplete: finishLoader })
      .from(".hero__eyebrow", { y: 30, opacity: 0, duration: 0.7 }, "-=0.2")
      .from(
        ".hero__title-line",
        { yPercent: 120, opacity: 0, duration: 1, ease: "power4.out" },
        "-=0.4"
      )
      .from(".hero__typing", { opacity: 0, y: 20, duration: 0.6 }, "-=0.5")
      .from(".hero__desc", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
      .from(
        ".hero__actions .btn",
        { opacity: 0, y: 24, stagger: 0.12, duration: 0.6 },
        "-=0.4"
      )
      .from(".hero__scroll", { opacity: 0, duration: 0.5 }, "-=0.2")
      .add(startTyping, "-=0.3");
  });

  function finishLoader() {
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
  }

  /* fallback if load already fired / slow */
  setTimeout(() => {
    if (!loader.classList.contains("is-done")) {
      loaderBar.style.width = "100%";
      setTimeout(finishLoader, 400);
    }
  }, 2600);

  /* ---------------------------------------------------------------
     TYPING TEXT
  --------------------------------------------------------------- */
  const typedEl = document.getElementById("typed");
  const phrases = [
    "Creative Engineer & Designer",
    "Crafting premium digital experiences",
    "Designing with intent",
    "Building bold interfaces",
  ];
  let typingStarted = false;
  function startTyping() {
    if (typingStarted || !typedEl) return;
    typingStarted = true;
    if (prefersReduced) {
      typedEl.textContent = phrases[0];
      return;
    }
    let pi = 0,
      ci = 0,
      deleting = false;
    (function tick() {
      const word = phrases[pi];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting) {
        ci++;
        if (ci > word.length) {
          deleting = true;
          return setTimeout(tick, 1600);
        }
      } else {
        ci--;
        if (ci < 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 85);
    })();
  }

  /* ---------------------------------------------------------------
     NAVBAR — sticky state, active link, mobile menu
  --------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navLinks = Array.from(document.querySelectorAll(".navbar__link"));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
    // scroll progress
    const h = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById("scrollProgress").style.width =
      (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    // active section
    let current = sections[0]?.id;
    const mid = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((s) => {
      if (s.offsetTop <= mid) current = s.id;
    });
    navLinks.forEach((l) =>
      l.classList.toggle(
        "is-active",
        l.getAttribute("href") === "#" + current
      )
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // mobile burger
  const burger = document.getElementById("navBurger");
  const navMenu = document.getElementById("navMenu");
  burger.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open && gsap) {
      gsap.fromTo(
        navMenu.querySelectorAll("li"),
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, duration: 0.4 }
      );
    }
  });
  navLinks.forEach((l) =>
    l.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------------------------------------------------------
     CUSTOM CURSOR + SPOTLIGHT
  --------------------------------------------------------------- */
  const cursor = document.getElementById("cursor");
  const spot = document.getElementById("cursorSpot");
  if (!isTouch) {
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2,
      sx = mx,
      sy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const spotLoop = () => {
      sx += (mx - sx) * 0.12;
      sy += (my - sy) * 0.12;
      spot.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%)`;
      requestAnimationFrame(spotLoop);
    };
    spotLoop();

    const hoverSel =
      "a, button, .card, [data-magnetic], [data-tilt], .field input, .field textarea";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverSel)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverSel)) cursor.classList.remove("is-hover");
    });
  }

  /* ---------------------------------------------------------------
     MOUSE-FOLLOW TILT (hero content + cards)
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const strength = el.classList.contains("hero__title") ? 8 : 6;
      let raf;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateY(${
            px * strength
          }deg) rotateX(${py * -strength}deg) translateZ(0)`;
        });
      });
      el.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      });
    });
  }

  /* ---------------------------------------------------------------
     MAGNETIC BUTTONS
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      let raf;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transition = "transform 0.2s var(--ease)";
          el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
        });
      });
      el.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        el.style.transition = "transform 0.5s var(--ease)";
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------------
     FLOATING PARTICLES (canvas)
  --------------------------------------------------------------- */
  const canvas = document.getElementById("particles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, parts;
    const COUNT = window.innerWidth < 720 ? 40 : 80;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function init() {
      resize();
      parts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.1,
      }));
    }
    init();
    window.addEventListener("resize", init);

    (function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------------------------------------------------------------
     GSAP SCROLL ANIMATIONS — reveal, parallax, counters, bars
  --------------------------------------------------------------- */
  if (gsap && ScrollTrigger) {
    // reveal elements (cards, intros)
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // hero background parallax
    gsap.to("#heroBg", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // hero content fade on scroll
    gsap.to(".hero__content", {
      yPercent: 12,
      opacity: 0.35,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // section titles slide-in
    gsap.utils.toArray(".section__head").forEach((head) => {
      gsap.from(head.children, {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: head, start: "top 85%" },
      });
    });

    // stat counters
    document.querySelectorAll(".stat__num").forEach((el) => {
      const target = +el.dataset.count;
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => (el.textContent = Math.floor(obj.v)),
          });
        },
      });
    });

    // skill bars
    document.querySelectorAll(".skill__bar i").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () => (el.style.width = el.dataset.pct + "%"),
      });
    });
  } else {
    // no-GSAP fallback: just show everything
    document
      .querySelectorAll(".reveal, .fade-up")
      .forEach((el) => (el.style.opacity = 1));
  }

  /* ---------------------------------------------------------------
     CONTACT FORM (client-side demo)
  --------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    status.classList.remove("is-error", "is-ok");

    if (!name || !email || !message) {
      status.textContent = "Please fill in every field.";
      status.classList.add("is-error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "That email address looks off — please check it.";
      status.classList.add("is-error");
      return;
    }
    status.textContent = "Thanks, " + name + "! Your message has been sent.";
    status.classList.add("is-ok");
    form.reset();
  });

  /* ---------------------------------------------------------------
     FOOTER YEAR
  --------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
