let windowEntries = [];
let spinning = false;
let spinInterval;

fetch('https://aaronyyds.github.io/Group-Picker/sample.csv?nocache=' + new Date().getTime())
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

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const output = document.getElementById('output');
  output.innerHTML = '';

  for (let i = 0; i < groupCount; i++) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.id = `group-${i}`;
    let ul = '<ul>';
    for (let j = 0; j < perGroup; j++) {
      ul += `<li id="g${i}-m${j}">🎲</li>`;
    }
    ul += '</ul>';
    box.innerHTML = `<strong>第 ${i + 1} 组</strong>${ul}`;
    output.appendChild(box);
  }

  spinning = true;

  spinInterval = setInterval(() => {
    for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < perGroup; j++) {
        const randomEntry = windowEntries[Math.floor(Math.random() * windowEntries.length)];
        const li = document.getElementById(`g${i}-m${j}`);
        if (li) li.textContent = randomEntry.name;
      }
    }
  }, 50);
}

function stopSpinning() {
  if (!spinning) return;

  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);

  let attempt = 0;
  const maxAttempts = 1000;
  let finalGroups = [];

  while (attempt++ < maxAttempts) {
    let usedIndices = new Set();
    let groups = [];

    let success = true;

    for (let g = 0; g < groupCount; g++) {
      let group = [];

      // Step 1: Pick first 2 members to ensure full coverage
      let starterCombos = windowEntries
        .map((p1, idx1) => ({ ...p1, idx: idx1 }))
        .filter(p1 => !usedIndices.has(p1.idx))
        .flatMap(p1 => windowEntries
          .map((p2, idx2) => ({ ...p2, idx: idx2 }))
          .filter(p2 => !usedIndices.has(p2.idx) && p2.idx !== p1.idx)
          .map(p2 => [p1, p2])
        );

      let validStarters = starterCombos.find(([a, b]) => {
        const roles = new Set([a.role, b.role]);
        const levels = new Set([a.level, b.level]);
        return roles.has('buyer') && roles.has('sourcing') && levels.has('senior') && levels.has('junior');
      });

      if (!validStarters) {
        success = false;
        break;
      }

      let [first, second] = validStarters;
      group.push(first);
      group.push(second);
      usedIndices.add(first.idx);
      usedIndices.add(second.idx);

      // Step 2: Fill remaining with intra-group switching
      let lastRole = second.role;
      let lastLevel = second.level;

      while (group.length < perGroup) {
        let expectedRole = Math.random() < 0.8 ? (lastRole === 'buyer' ? 'sourcing' : 'buyer') : lastRole;
        let expectedLevel = Math.random() < 0.8 ? (lastLevel === 'senior' ? 'junior' : 'senior') : lastLevel;

        let candidates = windowEntries
          .map((p, idx) => ({ ...p, idx }))
          .filter(p => !usedIndices.has(p.idx) && p.role === expectedRole && p.level === expectedLevel);

        if (candidates.length === 0) {
          // Relax condition
          candidates = windowEntries
            .map((p, idx) => ({ ...p, idx }))
            .filter(p => !usedIndices.has(p.idx));
        }

        if (candidates.length === 0) {
          // Fallback to BLANK
          group.push({ name: 'BLANK', role: 'sourcing', level: 'junior' });
        } else {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          group.push(pick);
          usedIndices.add(pick.idx);
          lastRole = pick.role;
          lastLevel = pick.level;
        }
      }

      groups.push(group);
    }

    if (success) {
      finalGroups = groups;
      break;
    }
  }

  if (finalGroups.length !== groupCount) {
    alert("生成分组失败，请检查样本数据是否足够多样。");
    return;
  }

  // Display final
  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < perGroup; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      li.textContent = finalGroups[i][j]?.name || 'BLANK';
    }
  }
}
