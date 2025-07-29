let spinning = false;
let spinInterval;
let windowEntries = [];

fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
  .then(response => response.text())
  .then(data => {
    windowEntries = data
      .split('\n')
      .slice(1)
      .map(line => {
        const [name, role, level] = line.split(',');
        return {
          name: name?.trim(),
          role: role?.trim().toLowerCase(),
          level: level?.trim().toLowerCase()
        };
      })
      .filter(entry => entry.name && entry.role && entry.level);
  });

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

  spinInterval = setInterval(() => {
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

        // Try to find person matching desired level
        let personIndex = pool.findIndex(p => p.level === currentLevel);

        // Fallback to anyone if not found
        if (personIndex === -1) {
          if (index >= pool.length) { enough = false; break; }
          personIndex = 0;
        }

        const [person] = pool.splice(personIndex, 1);
        if (!person) { enough = false; break; }

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
  }, 100);
}

function stopSpinning() {
  if (spinning) {
    clearInterval(spinInterval);
    spinning = false;
  }
}
