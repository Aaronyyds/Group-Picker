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

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function meetsHardConstraints(group) {
  const roles = new Set(group.map(p => p.role));
  const levels = new Set(group.map(p => p.level));
  return roles.has('sourcing') && roles.has('buyer') && levels.has('senior') && levels.has('junior');
}

function generateGroupsHardRule(entries, groupCount, perGroup) {
  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffle(entries);
    const groups = [];
    let valid = true;

    for (let i = 0; i < groupCount; i++) {
      const group = shuffled.slice(i * perGroup, (i + 1) * perGroup);
      if (group.length < perGroup || !meetsHardConstraints(group)) {
        valid = false;
        break;
      }
      groups.push(group);
    }

    if (valid) return groups;
  }

  alert("Unable to form valid groups with hard rules after 1000 attempts.");
  return [];
}

function displayGroups(groups) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = '';
  groups.forEach((group, i) => {
    const div = document.createElement('div');
    div.className = 'group-box';
    div.innerHTML = `<h3>第 ${i + 1} 组</h3><ul>` +
      group.map(p => `<li>${p.name}</li>`).join('') +
      '</ul>';
    container.appendChild(div);
  });
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
    const groups = generateGroupsHardRule(windowEntries, groupCount, perGroup);
    if (groups.length > 0) {
      displayGroups(groups);
    }
  }, 100);
}

function stopSpinning() {
  spinning = false;
  clearInterval(spinInterval);
}
