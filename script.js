    let windowEntries = [];
    let spinning = false;
    let spinInterval;

    // Load CSV data
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
        document.getElementById('startBtn').disabled = false;
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
  const totalNeeded = groupCount * perGroup;

  let finalGroups = [];
  let attempt = 0;
  const maxAttempts = 1000;

  while (finalGroups.length < groupCount && attempt++ < maxAttempts) {
    const tempGroups = [];
    let usedIndices = new Set();
    let success = true;

    for (let g = 0; g < groupCount; g++) {
      let group = [];

      // Step 1: Ensure first 2 members together have all 4 traits
      let pairFound = false;
      const candidates = windowEntries.map((p, idx) => ({ ...p, idx }))
        .filter(p => !usedIndices.has(p.idx));  // no filter on "blank" name

      for (let i = 0; i < candidates.length && !pairFound; i++) {
        for (let j = i + 1; j < candidates.length && !pairFound; j++) {
          const p1 = candidates[i];
          const p2 = candidates[j];

          const roles = new Set([p1.role, p2.role]);
          const levels = new Set([p1.level, p2.level]);

          const hasBuyerAndSourcing = roles.has('buyer') && roles.has('sourcing');
          const hasSeniorAndJunior = levels.has('senior') && levels.has('junior');

          if (hasBuyerAndSourcing && hasSeniorAndJunior) {
            group.push(p1, p2);
            usedIndices.add(p1.idx);
            usedIndices.add(p2.idx);
            pairFound = true;
          }
        }
      }

      if (!pairFound) {
        success = false;
        break;
      }

      // Step 2: Fill remaining group members using 0.8 switch logic
      let last = group[group.length - 1];
      while (group.length < perGroup) {
        let expectedRole = Math.random() < 0.8 ? (last.role === 'buyer' ? 'sourcing' : 'buyer') : last.role;
        let expectedLevel = Math.random() < 0.8 ? (last.level === 'junior' ? 'senior' : 'junior') : last.level;

        let candidates = windowEntries
          .map((p, idx) => ({ ...p, idx }))
          .filter(p =>
            !usedIndices.has(p.idx) &&
            (p.role === expectedRole && p.level === expectedLevel)
          );

        if (candidates.length === 0) {
          candidates = windowEntries
            .map((p, idx) => ({ ...p, idx }))
            .filter(p => !usedIndices.has(p.idx) && p.role === expectedRole);
        }

        if (candidates.length === 0) {
          candidates = windowEntries
            .map((p, idx) => ({ ...p, idx }))
            .filter(p => !usedIndices.has(p.idx));
        }

        if (candidates.length === 0) {
          success = false;
          break;
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        group.push(chosen);
        usedIndices.add(chosen.idx);
        last = chosen;
      }

      if (!success) break;
      tempGroups.push(group);
    }

    if (success) {
      finalGroups = tempGroups;
      break;
    }
  }

  if (finalGroups.length !== groupCount) {
    alert("生成分组失败，请检查样本数据是否足够多样。");
    return;
  }

  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < perGroup; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      li.textContent = finalGroups[i][j]?.name || 'BLANK';
    }
  }
}
