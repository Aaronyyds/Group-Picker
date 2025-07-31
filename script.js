let windowEntries = [];
let finalGroups = [];

// Load CSV once
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

// Group generation logic
function generateFinalGroups(groupCount, perGroup) {
  const sourcingPool = windowEntries.filter(p => p.role === 'sourcing');
  const buyerPool = windowEntries.filter(p => p.role === 'buyer');
  let sourcing = [...sourcingPool].sort(() => Math.random() - 0.5);
  let buyer = [...buyerPool].sort(() => Math.random() - 0.5);

  const groups = [];

  for (let i = 0; i < groupCount; i++) {
    const group = [];
    let role = Math.random() < 0.5 ? 'sourcing' : 'buyer';
    let level = Math.random() < 0.5 ? 'senior' : 'junior';

    for (let j = 0; j < perGroup; j++) {
      let pool = role === 'sourcing' ? sourcing : buyer;
      let personIndex = pool.findIndex(p => p.level === level);
      if (personIndex === -1) personIndex = 0;

      const [person] = pool.splice(personIndex, 1);
      if (!person) break;

      group.push(person);

      if (Math.random() < 0.9) role = role === 'sourcing' ? 'buyer' : 'sourcing';
      if (Math.random() < 0.8) level = level === 'senior' ? 'junior' : 'senior';
    }

    groups.push(group);
  }

  return groups;
}

// Start button: generate and show groups instantly
function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  if (!windowEntries || windowEntries.length < totalNeeded) {
    alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
    return;
  }

  finalGroups = generateFinalGroups(groupCount, perGroup);

  const output = document.getElementById('output');
  output.innerHTML = '';

  for (let i = 0; i < finalGroups.length; i++) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.id = `group-${i}`;
    box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
      finalGroups[i].map(p => `<li>${p.name}</li>`).join('')
    }</ul>`;
    output.appendChild(box);
  }
}

// Stop button (not needed now, kept for compatibility)
function stopSpinning() {
  // No operation needed since there's no spinning animation
}
