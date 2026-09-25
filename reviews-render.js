(function () {
  const combined = [
    ...(Array.isArray(window.MEP_REVIEWS_KO) ? window.MEP_REVIEWS_KO : []),
    ...(Array.isArray(window.MEP_IMPORTED_REVIEWS_KO) ? window.MEP_IMPORTED_REVIEWS_KO : []),
    ...(Array.isArray(window.MEP_GOOGLE_REVIEWS_KO) ? window.MEP_GOOGLE_REVIEWS_KO : [])
  ];
  const seen = new Set();
  const reviews = combined.filter((review) => {
    const signature = review.source === "My EDU Prep"
      ? `${review.source}|${String(review.text || review.title || "").replace(/\s+/g, " ").trim().toLowerCase()}`
      : review.id;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
  const states = new WeakMap();

  function isEnglish() {
    return document.body.dataset.lang === "en";
  }

  function appendText(parent, tag, className, value) {
    if (!value) return null;
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    parent.appendChild(element);
    return element;
  }

  function makeReviewCard(review) {
    const article = document.createElement("article");
    article.className = "review-card";
    article.dataset.reviewId = review.id;

    const top = document.createElement("div");
    top.className = "review-card__top";
    appendText(top, "span", "review-card__category", review.category);
    appendText(top, "span", "review-card__source", review.source || "My EDU Prep");
    article.appendChild(top);

    appendText(article, "h3", "review-card__title", isEnglish() && review.titleEn ? review.titleEn : review.title);
    appendText(article, "p", "review-card__text", isEnglish() && review.textEn ? review.textEn : review.text);

    const footer = document.createElement("footer");
    footer.className = "review-card__footer";
    const identity = document.createElement("div");
    appendText(identity, "strong", "", isEnglish() && review.displayNameEn ? review.displayNameEn : review.displayName);
    appendText(identity, "span", "", isEnglish() && review.institutionEn ? review.institutionEn : review.institution);
    footer.appendChild(identity);

    if (Number.isFinite(review.rating)) {
      const stars = document.createElement("span");
      stars.className = "review-card__rating";
      stars.setAttribute("aria-label", isEnglish() ? `${review.rating} out of 5 stars` : `${review.rating}점 만점 후기`);
      stars.textContent = "★".repeat(Math.max(0, Math.min(5, review.rating)));
      footer.appendChild(stars);
    }

    article.appendChild(footer);
    if (review.url) {
      const link = document.createElement("a");
      link.className = "review-card__link";
      link.href = review.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = isEnglish() ? "View original ↗" : "원문 보기 ↗";
      article.appendChild(link);
    }
    return article;
  }

  function render(container) {
    const state = states.get(container) || { category: "전체", source: "전체", visible: 12 };
    states.set(container, state);
    const mode = container.dataset.reviewMode || "all";
    const limit = Number.parseInt(container.dataset.reviewLimit || "0", 10);
    let selected = mode === "featured" ? reviews.filter((review) => review.featured) : reviews;
    if (state.category !== "전체") {
      selected = selected.filter((review) => review.category === state.category);
    }
    if (state.source !== "전체") {
      selected = selected.filter((review) => review.source === state.source);
    }
    const total = selected.length;
    const pageSize = Number.parseInt(container.dataset.reviewPageSize || "0", 10);
    if (limit > 0) selected = selected.slice(0, limit);
    else if (pageSize > 0) selected = selected.slice(0, state.visible);

    container.replaceChildren();
    if (!selected.length) {
      appendText(container, "p", "review-empty", isEnglish() ? "Reviews in this category are coming soon." : "해당 카테고리의 후기를 준비 중입니다.");
      return;
    }
    selected.forEach((review) => container.appendChild(makeReviewCard(review)));

    const summary = document.querySelector(`[data-review-summary][data-review-target="#${container.id}"]`);
    if (summary) summary.textContent = isEnglish()
      ? `Showing ${selected.length} of ${total} reviews.`
      : `총 ${total}개의 후기 중 ${selected.length}개를 보고 있습니다.`;
    const loadMore = document.querySelector(`[data-review-load-more][data-review-target="#${container.id}"]`);
    if (loadMore) {
      loadMore.hidden = selected.length >= total;
      loadMore.textContent = isEnglish()
        ? `Load more reviews (${Math.max(0, total - selected.length)} remaining)`
        : `후기 더 보기 (${Math.max(0, total - selected.length)}개 남음)`;
    }
  }

  document.querySelectorAll("[data-review-grid]").forEach((container) => render(container));

  document.querySelectorAll("[data-review-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filterGroup = button.closest("[data-review-filters]");
      if (!filterGroup?.dataset.reviewTarget) return;
      const target = document.querySelector(filterGroup.dataset.reviewTarget);
      if (!target) return;
      const state = states.get(target) || { category: "전체", source: "전체", visible: 12 };
      state.category = button.dataset.reviewFilter;
      state.visible = Number.parseInt(target.dataset.reviewPageSize || "12", 10);
      states.set(target, state);
      filterGroup.querySelectorAll("[data-review-filter]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      render(target);
    });
  });

  document.querySelectorAll("[data-review-source]").forEach((button) => {
    button.addEventListener("click", () => {
      const filterGroup = button.closest("[data-review-sources]");
      if (!filterGroup?.dataset.reviewTarget) return;
      const target = document.querySelector(filterGroup.dataset.reviewTarget);
      if (!target) return;
      const state = states.get(target) || { category: "전체", source: "전체", visible: 12 };
      state.source = button.dataset.reviewSource;
      state.visible = Number.parseInt(target.dataset.reviewPageSize || "12", 10);
      states.set(target, state);
      filterGroup.querySelectorAll("[data-review-source]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      render(target);
    });
  });

  document.querySelectorAll("[data-review-load-more]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.reviewTarget);
      if (!target) return;
      const state = states.get(target) || { category: "전체", source: "전체", visible: 12 };
      state.visible += Number.parseInt(target.dataset.reviewPageSize || "12", 10);
      states.set(target, state);
      render(target);
    });
  });
})();
