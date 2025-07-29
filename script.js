let spinning = false;
let spinInterval;
let windowsEntries = [];

fetch('sample.csv')
    .then(response => response.text())
    .then(data => {
        windowsEntries = data.split('\n').map(line => line.trim()).filter(line => line);
    });

function startSpinning() {
    const groupCount = parseInt(document.getElementById('groupCount').value);
    const perGroup = parseInt(document.getElementById('perGroup').value);
    const output = document.getElementById('output');
    output.innerHTML = '';

    if (!windowsEntries || windowsEntries.length < groupCount * perGroup) {
        alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
        return;
    }

    spinning = true;

    // Create group boxes
    for (let i = 0; i < groupCount; i++) {
        const box = document.createElement('div');
        box.className = 'group-box';
        box.id = `group-${i}`;
        box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul></ul>`;
        output.appendChild(box);
    }

    // Start interval that changes content every 100ms
    spinInterval = setInterval(() => {
        for (let i = 0; i < groupCount; i++) {
            const ul = document.querySelector(`#group-${i} ul`);
            ul.innerHTML = '';
            const tempShuffle = [...windowsEntries].sort(() => Math.random() - 0.5);
            for (let j = 0; j < perGroup; j++) {
                const li = document.createElement('li');
                li.textContent = tempShuffle[j];
                ul.appendChild(li);
            }
        }
    }, 100);
}

function stopSpinning() {
    if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = null;
        spinning = false;
    }
}
