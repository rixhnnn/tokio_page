document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("[data-streets-modal]");

  if (!modal) {
    return;
  }

  const modalImage = modal.querySelector("[data-streets-modal-image]");
  const modalName = modal.querySelector("[data-streets-modal-name]");
  const modalTitle = modal.querySelector("[data-streets-modal-title]");
  const modalDescription = modal.querySelector("[data-streets-modal-description]");
  const closeButtons = modal.querySelectorAll("[data-streets-modal-close]");
  const openButtons = document.querySelectorAll("[data-streets-modal-open]");
  let activeTrigger = null;

  const openModal = (trigger) => {
    const { title, name, image, description } = trigger.dataset;

    activeTrigger = trigger;
    modalImage.src = image || "";
    modalImage.alt = title ? `Район ${title}` : "";
    modalName.textContent = name || "";
    modalTitle.textContent = title || "";
    modalDescription.textContent = description || "";

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
});
