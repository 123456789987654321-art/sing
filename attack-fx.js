const attackEffects = new Map();

function clearAttackEffect(host) {
  const active = attackEffects.get(host);
  if (!active) return;
  clearTimeout(active.timer);
  active.effect.remove();
  active.target.classList.remove('attack-impact');
  attackEffects.delete(host);
}

function clearAttackEffects() {
  for (const host of [...attackEffects.keys()]) clearAttackEffect(host);
}

window.addEventListener('resize', clearAttackEffects);

function playAttackEffect(host, target, damage, label = '') {
  clearAttackEffect(host);
  const bounds = host.getBoundingClientRect();
  const hit = target.getBoundingClientRect();
  const effect = document.createElement('div');
  effect.className = 'attack-fx' + (damage === 0 ? ' is-zero' : '');
  effect.setAttribute('aria-hidden', 'true');
  const halfWidth = Math.min(300, host.clientWidth - 32) / 2;
  effect.style.left = `${Math.max(halfWidth + 16, Math.min(host.clientWidth - halfWidth - 16, hit.left + hit.width / 2 - bounds.left)) + host.scrollLeft}px`;
  effect.style.top = `${Math.max(75, Math.min(bounds.height - 75, hit.top + hit.height / 2 - bounds.top)) + host.scrollTop}px`;
  for (const name of ['attack-glow', 'attack-ring', 'attack-slash slash-one', 'attack-slash slash-two']) {
    const part = document.createElement('span'); part.className = name; effect.append(part);
  }
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('span');
    const angle = i * Math.PI / 4;
    spark.className = 'attack-spark';
    spark.style.setProperty('--spark-x', `${Math.cos(angle) * (85 + i % 2 * 20)}px`);
    spark.style.setProperty('--spark-y', `${Math.sin(angle) * 58}px`);
    spark.style.setProperty('--spark-turn', `${i * 45}deg`);
    effect.append(spark);
  }
  const number = document.createElement('span');
  number.className = 'attack-number';
  number.textContent = label || (damage ? `−${damage}` : '0');
  effect.append(number);
  host.append(effect);
  if (damage) { target.classList.remove('attack-impact'); void target.offsetWidth; target.classList.add('attack-impact'); }
  const timer = setTimeout(() => clearAttackEffect(host), 760);
  attackEffects.set(host, {effect, target, timer});
}
