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
    let sourcing = windowEntries.filter(p => p.role === 'sourcing');
    let buyer = windowEntries.filter(p => p.role === 'buyer');

    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    sourcing = shuffle(sourcing);
    buyer = shuffle(buyer);

    const groups = [];
    let sourcingIndex = 0;
    let buyerIndex = 0;

    for (let i = 0; i < groupCount; i++) {
      const group = [];
      let currentRole = Math.random() < 0.5 ? 'sourcing' : 'buyer';
      let currentLevel = Math.random() < 0.5 ? 'senior' : 'junior';

      for (let j = 0; j < perGroup; j++) {
        let pool = currentRole === 'sourcing' ? sourcing : buyer;

        // fallback: if pool empty, switch role
        if (pool.length === 0) {
          currentRole = currentRole === 'sourcing' ? 'buyer' : 'sourcing';
          pool = currentRole === 'sourcing' ? sourcing : buyer;
        }

        if (pool.length === 0) break; // nothing left

        // try to get matching level
        let idx = pool.findIndex(p => p.level === currentLevel);
        if (idx === -1) idx = 0; // fallback

        const [picked] = pool.splice(idx, 1);
        if (!picked) break;

        group.push(picked);

        // 90% switch role
        if (Math.random() < 0.9) {
          currentRole = currentRole === 'sourcing' ? 'buyer' : 'sourcing';
        }

        // 80% switch level
        if (Math.random() < 0.8) {
          currentLevel = currentLevel === 'senior' ? 'junior' : 'senior';
        }
      }

      groups.push(group);
    }

    // display groups
    for (let i = 0; i < groupCount; i++) {
      const groupBox = document.getElementById(`group-${i}`);
      const members = groups[i] || [];
      groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
        members.map(p => `<li>${p.name}</li>`).join('')
      }</ul>`;
    }

  }, 100);
}

function stopSpinning() {
  if (spinning) {
    clearInterval(spinInterval);
    spinning = false;
  }
}
