(() => {
  const container = document.querySelector("[data-about-gallery-ko]");
  const items = window.MEP_ABOUT_GALLERY_KO;
  const carouselTrack = document.querySelector("[data-about-carousel-track]");
  const carouselItems = window.MEP_ABOUT_CAROUSEL_KO;

  if (container && Array.isArray(items)) {
    items.forEach((item) => {
      const figure = document.createElement("figure");
      figure.className = `about-gallery-card about-gallery-card--${item.layout || "standard"}`;
      figure.setAttribute("data-reveal", "");

      const frame = document.createElement("div");
      frame.className = "about-gallery-card__frame";
      const sources = Array.isArray(item.images) && item.images.length ? item.images : [item.image];
      if (sources.length > 1) frame.classList.add("about-gallery-card__frame--stacked");
      sources.forEach((source, imageIndex) => {
        const image = document.createElement("img");
        image.src = source;
        image.alt = Array.isArray(item.alts) ? (item.alts[imageIndex] || "") : (item.alt || "");
        image.loading = "lazy";
        image.decoding = "async";
        if (item.fit) image.style.setProperty("--photo-fit", item.fit);
        if (item.position) image.style.setProperty("--photo-position", item.position);
        frame.appendChild(image);
      });

      const caption = document.createElement("figcaption");
      const label = document.createElement("span");
      label.textContent = item.label || "Field note";
      const copy = document.createElement("p");
      copy.textContent = item.caption || "";
      caption.append(label, copy);
      figure.append(frame, caption);
      container.appendChild(figure);
    });
  }

  if (carouselTrack && Array.isArray(carouselItems)) {
    carouselItems.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "about-carousel-card";
      figure.setAttribute("data-reveal", "");

      const frame = document.createElement("div");
      frame.className = "about-carousel-card__frame";
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt || "";
      image.loading = "lazy";
      image.decoding = "async";

      const applyImageRatio = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        const ratio = image.naturalWidth / image.naturalHeight;
        figure.style.setProperty("--photo-ratio", ratio.toFixed(4));
        figure.classList.add(ratio > 1.08 ? "is-landscape" : ratio < .92 ? "is-portrait" : "is-square");
      };
      if (image.complete) applyImageRatio();
      else image.addEventListener("load", applyImageRatio, { once: true });
      frame.appendChild(image);

      const caption = document.createElement("figcaption");
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("p");
      copy.textContent = item.caption || "";
      caption.append(number, copy);
      figure.append(frame, caption);
      carouselTrack.appendChild(figure);
    });

    document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        const distance = Math.min(carouselTrack.clientWidth * .82, 820);
        carouselTrack.scrollBy({
          left: button.dataset.carouselDirection === "previous" ? -distance : distance,
          behavior: "smooth"
        });
      });
    });
  }

  const newItems = document.querySelectorAll(".about-gallery-grid [data-reveal], .about-carousel [data-reveal]");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    newItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: .08, rootMargin: "0px 0px -30px" });
  newItems.forEach((item) => observer.observe(item));
})();
