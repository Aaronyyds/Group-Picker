let windowEntries = [];
let spinning = false;
let spinInterval;
let finalGroups = [];

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

  // Create group boxes with empty placeholders
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
  }, 50); // Update every 50ms
}

function stopSpinning() {
  if (!spinning) return;

  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  const finalPool = shuffle(windowEntries).slice(0, totalNeeded);
  let index = 0;

  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < perGroup; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      if (li && finalPool[index]) {
        li.textContent = finalPool[index].name;
        index++;
      }
    }
  }
}
