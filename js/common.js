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