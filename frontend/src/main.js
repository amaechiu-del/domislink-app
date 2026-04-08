import "./styles.css";
import { subdomains } from "./data/subdomains.js";

function renderCards() {
  const grid = document.getElementById("cards-grid");

  subdomains.forEach((item) => {
    const card = document.createElement("a");
    card.href = item.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "card";
    card.setAttribute("aria-label", `Visit ${item.name} — ${item.category}`);

    card.innerHTML = `
      <div class="card-accent" style="background: linear-gradient(90deg, ${item.color}, ${item.color}99);"></div>
      <div class="card-icon-wrap" style="background: ${item.color}22; color: ${item.color};">
        <span role="img" aria-hidden="true">${item.icon}</span>
      </div>
      <div>
        <p class="card-category" style="color: ${item.color};">${item.category}</p>
        <h3 class="card-name">${item.name}</h3>
      </div>
      <p class="card-description">${item.description}</p>
      <div class="card-footer">
        <span class="card-subdomain">${item.subdomain}.domislink.com</span>
        <span class="card-visit-btn" aria-hidden="true">
          Visit <span class="arrow">↗</span>
        </span>
      </div>
    `;

    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = `0 16px 48px ${item.color}22, 0 0 0 1px ${item.color}44`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "";
    });

    grid.appendChild(card);
  });
}

renderCards();
