let spinning = false;
let spinInterval;
let windowEntries = [];

// fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
//     .then(response => response.text())
//     .then(data => {
//         windowEntries = data.split('\n').map(line => line.trim()).filter(line => line);
//     });

fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
    .then(response => response.text())
    .then(data => {
        windowEntries = data
            .split('\n')
            .slice(1)
            .map(line => line.split(',')[0].trim())
            .filter(name => name);
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

    // Create placeholders for boxes
    for (let i = 0; i < groupCount; i++) {
        const box = document.createElement('div');
        box.className = 'group-box';
        box.id = `group-${i}`;
        box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${'<li>🎲</li>'.repeat(perGroup)}</ul>`;
        output.appendChild(box);
    }

    spinning = true;

    spinInterval = setInterval(() => {
        const shuffled = [...windowEntries].sort(() => Math.random() - 0.5);
        for (let i = 0; i < groupCount; i++) {
            const groupBox = document.getElementById(`group-${i}`);
            const names = shuffled.slice(i * perGroup, (i + 1) * perGroup);
            groupBox.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
                names.map(name => `<li>${name}</li>`).join('')
            }</ul>`;
        }
    }, 100);
}

function stopSpinning() {
    if (spinning) {
        clearInterval(spinInterval);
        spinning = false;
    }
}
