let spinning = false;
let spinInterval;
let windowEntries = [];

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

function weightedFilter(pool, targetKey, oppositeValue, weight = 0.9) {
  const same = pool.filter(p => p[targetKey] === oppositeValue);
  const opposite = pool.filter(p => p[targetKey] !== oppositeValue);

  return Math.random() < weight ? same.concat(opposite) : opposite.concat(same);
}

function buildGroups(entries, groupCount, perGroup) {
  const pool = [...entries];
  const groups = [];

  for (let i = 0; i < groupCount; i++) {
    const group = [];
    let last = null;

    for (let j = 0; j < perGroup; j++) {
      let candidates = pool;

      if (last) {
        candidates = weightedFilter(candidates, 'role', last.role, 0.8);
        candidates = weightedFilter(candidates, 'level', last.level, 0.8);
      }

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (!pick) break;

      group.push(pick);
      last = pick;

      const index = pool.findIndex(p => p.name === pick.name);
      if (index !== -1) pool.splice(index, 1);
    }

    groups.push(group);
  }

  return groups;
}

function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  if (!windowEntries || windowEntries.length < totalNeeded) {
    alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
    return;
  }

  spinning = true;
  spinInterval = setInterval(() => {
    const draftGroups = buildGroups(windowEntries, groupCount, perGroup);
    displayGroups(draftGroups, true);
  }, 100);
}

function stopSpinning() {
  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const finalGroups = buildGroups(windowEntries, groupCount, perGroup);
  displayGroups(finalGroups, false);
}

function displayGroups(groups, spinningMode) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  groups.forEach((group, i) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    groupDiv.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>` +
      group.map(entry => `<li>${entry.name}</li>`).join('') +
      '</ul>';
    resultDiv.appendChild(groupDiv);
  });
}
