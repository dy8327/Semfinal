// =========================
// Google Analytics 4
// =========================
(() => {
    const GA_ID = "G-3JRVKWNLJZ";

    // 중복 로드 방지
    if (window.__GA4_LOADED__) return;
    window.__GA4_LOADED__ = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
        window.dataLayer.push(arguments);
    };

    gtag("js", new Date());
    gtag("config", GA_ID);
})();


// =========================
// 공통 컴포넌트 로드
// =========================
document.addEventListener("DOMContentLoaded", async function () {
    await loadComponent("header", "/components/header.html");
    await loadComponent("footer", "/components/footer.html");
});

async function loadComponent(id, path) {
    const element = document.getElementById(id);

    if (!element) return;

    const response = await fetch(path);
    element.innerHTML = await response.text();
}