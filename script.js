let spinning = false;
let windowEntries = [];
let finalGroups = [];
let spinAnimation;

// Load CSV only once
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

function startSpinning() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  if (!windowEntries || windowEntries.length < totalNeeded) {
    alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
    return;
  }

  spinning = true;
  spinLoop();
}

function stopSpinning() {
  spinning = false;
  cancelAnimationFrame(spinAnimation);
  generateGroups();
  displayGroups();
}

function spinLoop() {
  if (!spinning) return;
  // Show temporary flashing names
  const groupBoxes = document.querySelectorAll('.groupBox');
  groupBoxes.forEach(box => {
    const random = windowEntries[Math.floor(Math.random() * windowEntries.length)];
    box.innerText = random.name;
  });
  spinAnimation = requestAnimationFrame(spinLoop);
}

function generateGroups() {
  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);

  const sourcing = windowEntries.filter(p => p.role === 'sourcing');
  const buyer = windowEntries.filter(p => p.role === 'buyer');

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  for (let attempt = 0; attempt < 1000; attempt++) {
    let sourcingPool = shuffle(sourcing);
    let buyerPool = shuffle(buyer);
    let groups = [];
    let success = true;

    for (let i = 0; i < groupCount; i++) {
      let group = [];
      let lastRole = '';
      let lastLevel = '';

      for (let j = 0; j < perGroup; j++) {
        let role = Math.random() < (lastRole === 'sourcing' ? 0.9 : 0.1) ? 'buyer' : 'sourcing';
        let level = Math.random() < (lastLevel === 'senior' ? 0.8 : 0.2) ? 'junior' : 'senior';

        let pool = role === 'sourcing' ? sourcingPool : buyerPool;
        let index = pool.findIndex(p => p.level === level);

        if (index === -1) {
          index = pool.length ? 0 : -1;
        }

        if (index === -1) {
          group.push({ name: 'Blank', role: role, level: level });
        } else {
          let person = pool.splice(index, 1)[0];
          group.push(person);
          lastRole = person.role;
          lastLevel = person.level;
        }
      }

      let hasSourcing = group.some(p => p.role === 'sourcing');
      let hasBuyer = group.some(p => p.role === 'buyer');
      let hasSenior = group.some(p => p.level === 'senior');
      let hasJunior = group.some(p => p.level === 'junior');

      if (!hasSourcing || !hasBuyer || !hasSenior || !hasJunior) {
        success = false;
        break;
      }
      groups.push(group);
    }

    if (success) {
      finalGroups = groups;
      return;
    }
  }

  alert("无法在1000次尝试中生成合适的分组。请检查数据。");
}

function displayGroups() {
  const container = document.getElementById('result');
  container.innerHTML = '';

  finalGroups.forEach((group, i) => {
    const div = document.createElement('div');
    div.className = 'groupBox';
    div.innerHTML = `<strong>Group ${i + 1}</strong><br>` + group.map(p =>
      `${p.name} (${capitalize(p.role)}, ${capitalize(p.level)})`).join('<br>');
    container.appendChild(div);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>
