function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  if (!windowEntries || windowEntries.length < totalNeeded) {
    alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
    return;
  }

  const output = document.getElementById('output');
  output.innerHTML = '';

  for (let i = 0; i < groupCount; i++) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.id = `group-${i}`;
    box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${'<li>🎲</li>'.repeat(perGroup)}</ul>`;
    output.appendChild(box);
  }

  spinning = true;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // Pre-shuffle pools once
  const sourcingBase = shuffle(windowEntries.filter(p => p.role === 'sourcing'));
  const buyerBase = shuffle(windowEntries.filter(p => p.role === 'buyer'));

  let attempts = 0;

  spinInterval = setInterval(() => {
    attempts++;
    if (attempts > 1000) {
      clearInterval(spinInterval);
      alert("无法在合理时间内生成组合，请检查样本分布。");
      return;
    }

    let sourcing = [...sourcingBase];
    let buyer = [...buyerBase];
    const groups = [];
    let sourcingIndex = 0;
    let buyerIndex = 0;
    let enough = true;

    for (let i = 0; i < groupCount; i++) {
      const group = [];
      let currentRole = Math.random() < 0.5 ? 'sourcing' : 'buyer';
      let currentLevel = Math.random() < 0.5 ? 'senior' : 'junior';

      for (let j = 0; j < perGroup; j++) {
        const pool = currentRole === 'sourcing' ? sourcing : buyer;
        const index = currentRole === 'sourcing' ? sourcingIndex : buyerIndex;

        let personIndex = pool.findIndex(p => p.level === currentLevel);

        if (personIndex === -1) {
          if (index >= pool.length) {
            enough = false;
            break;
          }
          personIndex = 0; // fallback to first
        }

        const [person] = pool.splice(personIndex, 1);
        if (!person) {
          enough = false;
          break;
        }

        if (currentRole === 'sourcing') sourcingIndex++;
        else buyerIndex++;

        group.push(person);

        // 90% chance to switch role
        if (Math.random() < 0.9) {
          currentRole = currentRole === 'sourcing' ? 'buyer' : 'sourcing';
        }

        // 80% chance to switch level
        if (Math.random() < 0.8) {
          currentLevel = currentLevel === 'senior' ? 'junior' : 'senior';
        }
      }

      if (!enough) break;
      groups.push(group);
    }

    if (enough) {
      for (let i = 0; i < groupCount; i++) {
        const groupBox = document.getElementById(`group-${i}`);
        groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
          groups[i].map(p => `<li>${p.name}</li>`).join('')
        }</ul>`;
      }
    }

  }, 100); // Lower this to 50ms for faster animation if desired
}
