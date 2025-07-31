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
  const totalNeeded = groupCount * perGroup;

  let finalGroups = [];
  let attempt = 0;
  const maxAttempts = 1000;

  while (attempt++ < maxAttempts) {
    let tempGroups = [];
    let usedNames = new Set();
    let success = true;

    const shuffledEntries = shuffle(windowEntries);

    for (let g = 0; g < groupCount; g++) {
      let group = [];

      // Step 1: Find two initial members with different role and level
      let firstTwoPicked = false;
      const candidates = shuffledEntries.filter(p => !usedNames.has(p.name));

      for (let i = 0; i < candidates.length && !firstTwoPicked; i++) {
        for (let j = i + 1; j < candidates.length && !firstTwoPicked; j++) {
          const a = candidates[i];
          const b = candidates[j];
          if (a.role !== b.role && a.level !== b.level) {
            group.push(a, b);
            usedNames.add(a.name);
            usedNames.add(b.name);
            firstTwoPicked = true;
          }
        }
      }

      if (!firstTwoPicked) {
        success = false;
        break;
      }

      // Step 2: Fill remaining with switch logic
      let last = group[group.length - 1];
      while (group.length < perGroup) {
        const expectedRole = Math.random() < 0.8 ? (last.role === 'buyer' ? 'sourcing' : 'buyer') : last.role;
        const expectedLevel = Math.random() < 0.8 ? (last.level === 'junior' ? 'senior' : 'junior') : last.level;

        let candidates = shuffledEntries.filter(p =>
          !usedNames.has(p.name) &&
          p.role === expectedRole &&
          p.level === expectedLevel
        );

        if (candidates.length === 0) {
          candidates = shuffledEntries.filter(p =>
            !usedNames.has(p.name) &&
            p.role === expectedRole
          );
        }

        if (candidates.length === 0) {
          candidates = shuffledEntries.filter(p => !usedNames.has(p.name));
        }

        if (candidates.length === 0) {
          success = false;
          break;
        }

        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        group.push(selected);
        usedNames.add(selected.name);
        last = selected;
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
