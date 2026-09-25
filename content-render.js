(function () {
  const content = Array.isArray(window.MEP_SERVICE_CONTENT_KO) ? window.MEP_SERVICE_CONTENT_KO : [];
  const platforms = window.MEP_CONTENT_PLATFORMS_KO || {};
  const typeLabels = { blog: "Article", testimonial: "Student story", video: "Video", profile: "Profile" };

  function isEnglish() {
    return document.body.dataset.lang === "en";
  }

  function getPlatform(item) {
    if (item.platform) return item.platform;
    if (item.url.includes("blog.naver.com")) return "naver";
    if (item.url.includes("youtube.com")) return "youtube";
    if (item.url.includes("instagram.com")) return "instagram";
    if (item.url.includes("threads.com") || item.url.includes("threads.net")) return "threads";
    if (item.url.includes("linkedin.com")) return "linkedin";
    return "website";
  }

  function addText(parent, tag, className, value) {
    if (!value) return null;
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    parent.appendChild(element);
    return element;
  }

  function makeCard(item) {
    const link = document.createElement("a");
    link.className = "content-card";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";

    const meta = document.createElement("div");
    meta.className = "content-card__meta";
    addText(meta, "span", "", typeLabels[item.type] || item.type);
    addText(meta, "span", "", item.date);
    link.appendChild(meta);
    addText(link, "h3", "", item.title);
    addText(link, "p", "", item.description);

    const footer = document.createElement("div");
    footer.className = "content-card__footer";
    const platform = platforms[getPlatform(item)];
    const handle = item.handle || platform?.handle;
    addText(footer, "span", "", handle ? `${item.source} · ${handle}` : item.source);
    addText(footer, "span", "", isEnglish() ? "Read more →" : "읽어보기 →");
    link.appendChild(footer);
    return link;
  }

  function render(container, service) {
    const limit = Number.parseInt(container.dataset.contentLimit || "0", 10);
    const platformMode = container.dataset.contentMode === "platform";
    let selected;
    if (platformMode) {
      const platformContent = content.filter((item) => ["naver", "youtube", "instagram", "threads", "linkedin"].includes(getPlatform(item)));
      selected = service === "all" ? platformContent : platformContent.filter((item) => getPlatform(item) === service);
    } else {
      selected = service === "all" ? content : content.filter((item) => item.services.includes(service));
    }
    if (limit > 0) selected = selected.slice(0, limit);
    container.replaceChildren();
    selected.forEach((item) => container.appendChild(makeCard(item)));
  }

  document.querySelectorAll("[data-service-content]").forEach((container) => {
    render(container, container.dataset.contentService || "all");
  });

  document.querySelectorAll("[data-content-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest("[data-content-filters]");
      if (!group?.dataset.contentTarget) return;
      const target = document.querySelector(group.dataset.contentTarget);
      if (!target) return;
      group.querySelectorAll("[data-content-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      render(target, button.dataset.contentFilter || "all");
    });
  });
})();
