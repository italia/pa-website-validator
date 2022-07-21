const buttons = document.querySelectorAll("[data-element=search-submit]");

for (const button of buttons) {
  button.onclick = () => {
    window.location = "/scuole-risultati-ricerca.html";
  };
}
