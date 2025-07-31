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
  const totalNeeded = groupCount * perGroup;

  if (!windowEntries || windowEntries.length < totalNeeded) {
    alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
    return;
  }

  const output = document.getElementById('output');
  output.innerHTML = '';

  // Create group boxes with spinning names
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
  }, 50); // fast spin effect
}

function stopSpinning() {
  if (!spinning) return;

  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  const finalGroups = [];
  let usedIndices = new Set();
  let attempt = 0;
  const maxAttempts = 1000;

  while (finalGroups.length < groupCount && attempt++ < maxAttempts) {
    const tempGroups = [];
    let lastRole = Math.random() < 0.5 ? 'buyer' : 'sourcing';
    let lastLevel = Math.random() < 0.5 ? 'junior' : 'senior';

    usedIndices = new Set();

    let success = true;
    for (let g = 0; g < groupCount; g++) {
      const group = [];

      for (let m = 0; m < perGroup; m++) {
        let role = Math.random() < 0.9 ? (lastRole === 'buyer' ? 'sourcing' : 'buyer') : lastRole;
        let level = Math.random() < 0.8 ? (lastLevel === 'junior' ? 'senior' : 'junior') : lastLevel;

        const candidateIdx = windowEntries.findIndex((p, idx) =>
          !usedIndices.has(idx) &&
          p.role === role &&
          p.level === level
        );

        if (candidateIdx === -1) {
          success = false;
          break;
        }

        usedIndices.add(candidateIdx);
        const person = windowEntries[candidateIdx];
        group.push(person);
        lastRole = person.role;
        lastLevel = person.level;
      }

      if (!success) break;
      tempGroups.push(group);
    }

    if (success) {
      finalGroups.push(...tempGroups);
    }
  }

  if (finalGroups.length !== groupCount) {
    alert("生成分组失败，请检查样本数据是否足够多样。");
    return;
  }

  // Final display of names
  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < perGroup; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      li.textContent = finalGroups[i][j].name;
    }
  }
}
