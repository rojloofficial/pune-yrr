window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};

const siteHeader = document.getElementById("siteHeader");
let scrollUpdatePending = false;

window.addEventListener("scroll", () => {
  if (scrollUpdatePending) return;

  scrollUpdatePending = true;
  window.requestAnimationFrame(() => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 40);
    scrollUpdatePending = false;
  });
}, { passive: true });

const mobileMenuButton = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");

function setMobileMenuOpen(isOpen) {
  mobileDrawer.hidden = !isOpen;
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
}

mobileMenuButton.addEventListener("click", () => {
  setMobileMenuOpen(mobileDrawer.hidden);
});

mobileDrawer.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMobileMenuOpen(false));
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const wasExpanded = button.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-question").forEach((question) => {
      const isExpanded = question === button && !wasExpanded;
      question.setAttribute("aria-expanded", String(isExpanded));
      question.closest(".faq-item").classList.toggle("active", isExpanded);
    });
  });
});