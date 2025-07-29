let spinning = false;
let spinInterval;
let windowsEntries = [];

// Fetch CSV from GitHub Pages
fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
  .then(response => response.text())
  .then(data => {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    windowsEntries = lines.slice(1).map(line => {
      const [name, role, level] = line.split(',');
      return { name: name.trim(), role: role.trim(), level: level.trim() };
    });
  });

function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  if (!windowsEntries || windowsEntries.length < totalNeeded) {
    alert("无法在条目尝试中生成满足条件的分组。");
    return;
  }

  spinning = true;

  // Clear all groups
  const container = document.getElementById('groupsContainer');
  container.innerHTML = '';
  for (let i = 0; i < groupCount; i++) {
    const div = document.createElement('div');
    div.className = 'groupBox';
    div.id = `group-${i}`;
    container.appendChild(div);
  }

  spinInterval = setInterval(() => {
    const tempEntries = [...windowsEntries];
    const groups = [];

    for (let i = 0; i < groupCount; i++) {
      groups.push([]);
      for (let j = 0; j < perGroup; j++) {
        const randIndex = Math.floor(Math.random() * tempEntries.length);
        groups[i].push(tempEntries.splice(randIndex, 1)[0]);
      }
    }

    for (let i = 0; i < groupCount; i++) {
      const groupDiv = document.getElementById(`group-${i}`);
      groupDiv.innerHTML = groups[i].map(e => e.name).join('<br>');
    }
  }, 100);
}

function stopSpinning() {
  spinning = false;
  clearInterval(spinInterval);

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  let validGroups = [];
  for (let attempt = 0; attempt < 1000; attempt++) {
    const shuffled = [...windowsEntries].sort(() => 0.5 - Math.random());
    const candidate = [];
    let valid = true;

    for (let i = 0; i < groupCount; i++) {
      const group = shuffled.slice(i * perGroup, (i + 1) * perGroup);
      const levels = group.map(e => e.level);
      if (!(levels.includes("Senior") && levels.includes("Junior"))) {
        valid = false;
        break;
      }
      candidate.push(group);
    }

    if (valid) {
      validGroups = candidate;
      break;
    }
  }

  if (validGroups.length === 0) {
    alert("无法在多次尝试中生成满足条件的分组。");
    return;
  }

  const container = document.getElementById('groupsContainer');
  container.innerHTML = '';
  validGroups.forEach((group, idx) => {
    const div = document.createElement('div');
    div.className = 'groupBox';
    div.innerHTML = `<strong>Group ${idx + 1}</strong><br>` + group.map(e => e.name).join('<br>');
    container.appendChild(div);
  });
}
