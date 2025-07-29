<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Group Picker with Role Bias</title>
  <style>
    .group-box {
      display: inline-block;
      width: 200px;
      margin: 10px;
      padding: 10px;
      border: 2px solid #333;
      border-radius: 10px;
      text-align: center;
    }
    ul {
      list-style: none;
      padding: 0;
    }
  </style>
</head>
<body>
  <h2>随机分组</h2>
  <label>组数:
    <input type="number" id="groupCount" value="3" min="1" max="10">
  </label>
  <label>每组人数:
    <input type="number" id="perGroup" value="3" min="1" max="10">
  </label>
  <button onclick="startSpinning()">开始</button>
  <button onclick="stopSpinning()">停止</button>

  <div id="output"></div>

  <script>
    let spinning = false;
    let spinInterval;
    let windowEntries = [];

    fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
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
          .filter(entry => entry.name && entry.role);
      });

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

      for (let i = 0; i < groupCount; i++) {
        const box = document.createElement('div');
        box.className = 'group-box';
        box.id = `group-${i}`;
        box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${'<li>🎲</li>'.repeat(perGroup)}</ul>`;
        output.appendChild(box);
      }

      spinning = true;

      spinInterval = setInterval(() => {
        const sourcingPool = windowEntries.filter(p => p.role === 'sourcing');
        const buyerPool = windowEntries.filter(p => p.role === 'buyer');

        const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
        let sourcing = shuffle(sourcingPool);
        let buyer = shuffle(buyerPool);

        const groups = [];
        let sourcingIndex = 0;
        let buyerIndex = 0;
        let enough = true;

        for (let i = 0; i < groupCount; i++) {
          const group = [];
          let currentRole = Math.random() < 0.5 ? 'sourcing' : 'buyer';

          for (let j = 0; j < perGroup; j++) {
            if (currentRole === 'sourcing') {
              if (sourcingIndex >= sourcing.length) { enough = false; break; }
              group.push(sourcing[sourcingIndex++]);
            } else {
              if (buyerIndex >= buyer.length) { enough = false; break; }
              group.push(buyer[buyerIndex++]);
            }

            // 80% chance to flip to the other role
            if (Math.random() < 0.99) {
              currentRole = currentRole === 'sourcing' ? 'buyer' : 'sourcing';
            }
          }

          if (!enough) break;
          groups.push(group);
        }

        if (enough) {
          for (let i = 0; i < groupCount; i++) {
            const groupBox = document.getElementById(`group-${i}`);
            groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
              groups[i].map(p => `<li>${p.name}</li>`).join('')
            }</ul>`;
          }
        }
      }, 100);
    }

    function stopSpinning() {
      if (spinning) {
        clearInterval(spinInterval);
        spinning = false;
      }
    }
  </script>
</body>
</html>
