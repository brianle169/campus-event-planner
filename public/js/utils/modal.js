export function showConfirmModal(message, confirmText = "Yes", confirmClass = "btn-primary") {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    if (!modal) {
        console.warn("confirmModal not found in the DOM");
        return resolve(false);
    }
    
    const textEl = document.getElementById("confirmModalText");
    if (textEl) textEl.textContent = message;
    
    const yesBtn = document.getElementById("confirm-yes");
    if (yesBtn) {
        yesBtn.textContent = confirmText;
        yesBtn.className = `btn ${confirmClass}`;
    }
    
    modal.style.display = "flex";
    const noBtn = document.getElementById("confirm-no");
    
    const cleanup = () => {
        modal.style.display = "none";
        yesBtn.removeEventListener("click", onYes);
        noBtn.removeEventListener("click", onNo);
    };
    
    const onYes = (e) => { e.preventDefault(); cleanup(); resolve(true); };
    const onNo = (e) => { e.preventDefault(); cleanup(); resolve(false); };
    
    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}
