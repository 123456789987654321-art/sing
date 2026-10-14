// Keep the battle in view with native, keyboard-accessible disclosures.
const compactLayout = window.matchMedia('(max-width: 1050px)');
function syncSupportPanels() {
  document.getElementById('inspirationPanel').open = !compactLayout.matches;
}
syncSupportPanels();
compactLayout.addEventListener('change', syncSupportPanels);
document.getElementById('suggestions').addEventListener('click', event => {
  if (compactLayout.matches && event.target.closest('.poem-tile')) {
    document.getElementById('inspirationPanel').open = false;
    document.getElementById('poemInput').focus({ preventScroll: true });
    document.getElementById('attackForm').scrollIntoView({ block: 'nearest' });
  }
});
