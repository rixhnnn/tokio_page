document.addEventListener("DOMContentLoaded", () => {
  const setupTelegramHeaderFix = () => {
    const header = document.querySelector(".header");
    const userAgent = navigator.userAgent || "";
    const params = new URLSearchParams(window.location.search);
    const isTelegramBrowser = /Telegram|Telegram-iOS|TelegramAndroid|TgWebView/i.test(userAgent)
      || Boolean(window.Telegram && window.Telegram.WebApp)
      || params.has("tgHeaderFix");

    if (!header || !isTelegramBrowser) {
      return;
    }

    document.documentElement.classList.add("is-telegram-webview");

    let isTicking = false;

    const syncHeaderPosition = () => {
      isTicking = false;
      const scrollTop = Math.max(window.scrollY || window.pageYOffset || 0, 0);
      header.style.setProperty("--telegram-header-top", `${scrollTop}px`);
    };

    const requestSync = () => {
      if (isTicking) {
        return;
      }

      isTicking = true;
      window.requestAnimationFrame(syncHeaderPosition);
    };

    syncHeaderPosition();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("scroll", requestSync, { passive: true });
      window.visualViewport.addEventListener("resize", requestSync);
    }
  };

  setupTelegramHeaderFix();

  const revealSections = document.querySelectorAll("[data-reveal-section]");

  revealSections.forEach((section) => {
    section.querySelectorAll(".reveal-item").forEach((item, index) => {
      item.style.setProperty("--reveal-index", index);
    });

    section.querySelectorAll(".reveal-letters").forEach((title) => {
      title.querySelectorAll("span:not(.reveal-letters__word)").forEach((letter, index) => {
        letter.style.setProperty("--letter-index", index);
      });
    });

    section.querySelectorAll(".streets__card").forEach((card, index) => {
      card.style.setProperty("--card-index", index);
    });
  });

  const revealSection = (section) => {
    section.classList.add("is-visible");
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealSection(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -16% 0px",
      threshold: 0.12,
    });

    revealSections.forEach((section) => {
      revealObserver.observe(section);
    });
  } else {
    revealSections.forEach(revealSection);
  }

  window.requestAnimationFrame(() => {
    const welcome = document.querySelector(".reveal-section--welcome");

    if (welcome) {
      revealSection(welcome);
    }
  });

  const modal = document.querySelector("[data-streets-modal]");

  if (!modal) {
    return;
  }

  const modalImage = modal.querySelector("[data-streets-modal-image]");
  const modalName = modal.querySelector("[data-streets-modal-name]");
  const modalTitle = modal.querySelector("[data-streets-modal-title]");
  const modalDescription = modal.querySelector("[data-streets-modal-description]");
  const prevButton = modal.querySelector("[data-streets-modal-prev]");
  const nextButton = modal.querySelector("[data-streets-modal-next]");
  const closeButtons = modal.querySelectorAll("[data-streets-modal-close]");
  const openButtons = document.querySelectorAll("[data-streets-modal-open]");
  let activeTrigger = null;
  let galleryImages = [];
  let activeImageIndex = 0;

  const setActiveImage = (index, title, direction = "next") => {
    activeImageIndex = (index + galleryImages.length) % galleryImages.length;
    const src = galleryImages[activeImageIndex];
    const directionClass = direction === "prev" ? "is-sliding-prev" : "is-sliding-next";

    const applyImage = () => {
      modalImage.classList.remove("is-sliding-prev", "is-sliding-next");
      modalImage.src = src;
      modalImage.alt = title ? `Район ${title}` : "";
      modalImage.getBoundingClientRect();
      window.requestAnimationFrame(() => {
        modalImage.classList.add("is-loaded", directionClass);
      });
    };

    if (modalImage.getAttribute("src") === src) {
      applyImage();
      return;
    }

    const preloadImage = new Image();
    preloadImage.onload = applyImage;
    preloadImage.src = src;
  };

  const openModal = (trigger) => {
    const { title, name, image, gallery, description } = trigger.dataset;

    activeTrigger = trigger;
    galleryImages = (gallery || image || "").split(",").map((item) => item.trim()).filter(Boolean);
    if (!galleryImages.length && image) {
      galleryImages = [image];
    }

    modalName.textContent = name || "";
    modalTitle.textContent = title || "";
    modalDescription.textContent = description || "";
    setActiveImage(0, title, "next");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");

    modal.querySelector("[data-streets-modal-close]").focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");

    if (activeTrigger) {
      activeTrigger.focus();
      activeTrigger = null;
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  prevButton.addEventListener("click", () => {
    setActiveImage(activeImageIndex - 1, modalTitle.textContent, "prev");
  });

  nextButton.addEventListener("click", () => {
    setActiveImage(activeImageIndex + 1, modalTitle.textContent, "next");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }

    if (event.key === "ArrowLeft" && modal.classList.contains("is-open")) {
      setActiveImage(activeImageIndex - 1, modalTitle.textContent, "prev");
    }

    if (event.key === "ArrowRight" && modal.classList.contains("is-open")) {
      setActiveImage(activeImageIndex + 1, modalTitle.textContent, "next");
    }
  });
});
