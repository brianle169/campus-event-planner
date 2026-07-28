const links = document.querySelectorAll(".nav-link");
const tabs = document.querySelectorAll(".tab-content");

links.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        // Highlight selected menu item
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        // Show the corresponding content
        tabs.forEach(tab => tab.classList.remove("active"));

        const selectedTab = document.getElementById(link.dataset.tab);
        selectedTab.classList.add("active");
    });
});