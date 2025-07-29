
fetch('sample.csv')
    .then(response => response.text())
    .then(data => {
        window.entries = data.split('\n').map(line => line.trim()).filter(line => line);
    });

function generateGroups() {
    const groupCount = parseInt(document.getElementById('groupCount').value);
    const perGroup = parseInt(document.getElementById('perGroup').value);
    const totalNeeded = groupCount * perGroup;

    if (!window.entries || window.entries.length < totalNeeded) {
        alert("样本数量不足，请检查 sample.csv 中是否有足够数据。");
        return;
    }

    const shuffled = [...window.entries].sort(() => Math.random() - 0.5);
    const output = document.getElementById('output');
    output.innerHTML = '';

    for (let i = 0; i < groupCount; i++) {
        const box = document.createElement('div');
        box.className = 'group-box';
        box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
            shuffled.slice(i * perGroup, (i + 1) * perGroup).map(name => `<li>${name}</li>`).join('')
        }</ul>`;
        output.appendChild(box);
    }
}
