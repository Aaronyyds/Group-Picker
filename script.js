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

  let attempt = 0;
  let success = false;
  let finalGroups = [];

  while (attempt++ < 1000) {
    const usedNames = new Set();
    finalGroups = [];
    let shuffled = shuffle([...windowEntries]);

    // Normalize names (trim to prevent hidden mismatches)
    shuffled = shuffled.map(entry => ({
      name: entry.name.trim(),
      role: entry.role.trim().toLowerCase(),
      level: entry.level.trim().toLowerCase()
    }));

    let available = [...shuffled];

    for (let g = 0; g < groupCount; g++) {
      const group = [];

      // Step 1: Select 2 diverse starters
      let starters = [];
      for (let i = 0; i < available.length; i++) {
        for (let j = i + 1; j < available.length; j++) {
          const a = available[i];
          const b = available[j];
          if (
            a.role !== b.role &&
            a.level !== b.level &&
            !usedNames.has(a.name) &&
            !usedNames.has(b.name)
          ) {
            starters = [a, b];
            break;
          }
        }
        if (starters.length === 2) break;
      }

      if (starters.length < 2) break; // Retry whole grouping

      group.push(...starters);
      usedNames.add(starters[0].name);
      usedNames.add(starters[1].name);

      // Step 2: Continue picking with switching probability
      while (group.length < perGroup) {
        const last = group[group.length - 1];
        const wantRole = Math.random() < 0.8 ? (last.role === 'buyer' ? 'sourcing' : 'buyer') : last.role;
        const wantLevel = Math.random() < 0.8 ? (last.level === 'junior' ? 'senior' : 'junior') : last.level;

        let candidates = available.filter(
          p => !usedNames.has(p.name) && p.role === wantRole && p.level === wantLevel
        );

        if (candidates.length === 0) {
          candidates = available.filter(p => !usedNames.has(p.name));
        }

        if (candidates.length === 0) break;

        const next = candidates[Math.floor(Math.random() * candidates.length)];
        group.push(next);
        usedNames.add(next.name);
      }

      if (group.length < perGroup) break;
      finalGroups.push(group);
    }

    if (finalGroups.length === groupCount) {
      success = true;
      break;
    }
  }

  if (!success) {
    alert("Failed to generate valid groups without duplicates after multiple attempts.");
    return;
  }

  // Output
  for (let i = 0; i < finalGroups.length; i++) {
    const group = finalGroups[i];
    for (let j = 0; j < group.length; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      li.textContent = group[j].name;
    }
  }
}
