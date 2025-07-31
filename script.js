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

  // create group boxes with placeholders
  for (let i = 0; i < groupCount; i++) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.id = `group-${i}`;
    box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>` +
      Array.from({ length: perGroup }, () => `<li>🎲</li>`).join('') +
      `</ul>`;
    output.appendChild(box);
  }

  spinning = true;

  spinInterval = setInterval(() => {
    for (let i = 0; i < groupCount; i++) {
      const groupBox = document.getElementById(`group-${i}`);
      const lis = groupBox.getElementsByTagName('li');

      for (let j = 0; j < perGroup; j++) {
        const random = windowEntries[Math.floor(Math.random() * windowEntries.length)];
        lis[j].textContent = random.name;
      }
    }
  }, 50); // fast update
}

function stopSpinning() {
  if (!spinning) return;

  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);

  // actual final group assignment
  const entriesCopy = shuffle(windowEntries);
  const groups = [];

  let index = 0;
  for (let i = 0; i < groupCount; i++) {
    const group = [];
    for (let j = 0; j < perGroup; j++) {
      if (index < entriesCopy.length) {
        group.push(entriesCopy[index++]);
      }
    }
    groups.push(group);
  }

  finalGroups = groups;

  // update UI with final names
  for (let i = 0; i < groups.length; i++) {
    const groupBox = document.getElementById(`group-${i}`);
    groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>` +
      groups[i].map(p => `<li>${p.name}</li>`).join('') +
      `</ul>`;
  }
}
