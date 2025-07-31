let finalGroups = [];

function generateGroups() {
  const sourcingPool = windowEntries.filter(p => p.role === 'sourcing');
  const buyerPool = windowEntries.filter(p => p.role === 'buyer');

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  let sourcing = shuffle(sourcingPool);
  let buyer = shuffle(buyerPool);

  const groups = [];
  let sourcingIndex = 0;
  let buyerIndex = 0;
  let enough = true;

  for (let i = 0; i < groupCount; i++) {
    const group = [];
    let currentRole = Math.random() < 0.5 ? 'sourcing' : 'buyer';
    let currentLevel = Math.random() < 0.5 ? 'senior' : 'junior';

    for (let j = 0; j < perGroup; j++) {
      let pool = currentRole === 'sourcing' ? sourcing : buyer;
      let index = currentRole === 'sourcing' ? sourcingIndex : buyerIndex;

      let personIndex = pool.findIndex(p => p.level === currentLevel);
      if (personIndex === -1) {
        if (index >= pool.length) { enough = false; break; }
        personIndex = 0;
      }

      const [person] = pool.splice(personIndex, 1);
      if (!person) { enough = false; break; }

      if (currentRole === 'sourcing') sourcingIndex++;
      else buyerIndex++;

      group.push(person);

      if (Math.random() < 0.85) currentRole = currentRole === 'sourcing' ? 'buyer' : 'sourcing';
      if (Math.random() < 0.85) currentLevel = currentLevel === 'senior' ? 'junior' : 'senior';
    }

    if (!enough) break;
    groups.push(group);
  }

  return enough ? groups : [];
}

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

  // Generate groups once
  finalGroups = generateGroups();
  if (!finalGroups.length) {
    alert("分组失败，请检查样本分布是否均衡。");
    return;
  }

  spinning = true;

  spinInterval = setInterval(() => {
    for (let i = 0; i < groupCount; i++) {
      const groupBox = document.getElementById(`group-${i}`);
      groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
        finalGroups[i].map(() => `<li>${Math.random().toString(36).substring(2, 7)}</li>`).join('')
      }</ul>`;
    }
  }, 80); // faster update if desired
}

function stopSpinning() {
  if (spinning) {
    clearInterval(spinInterval);
    spinning = false;

    for (let i = 0; i < finalGroups.length; i++) {
      const groupBox = document.getElementById(`group-${i}`);
      groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
        finalGroups[i].map(p => `<li>${p.name}</li>`).join('')
      }</ul>`;
    }
  }
}
