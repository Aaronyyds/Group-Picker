let spinning = false;
let spinInterval;
let windowEntries = [];

fetch('https://aaronyyds.github.io/Group-Picker/sample.csv')
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('Name'));
        windowEntries = lines.map(line => {
            const [name, role, level] = line.split(',');
            return { name, role, level };
        });
    });

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function groupHasDiversity(group) {
    const roles = new Set(group.map(p => p.role));
    const levels = new Set(group.map(p => p.level));
    return roles.size >= 2 && levels.size >= 2;
}

function generateGroupsWithDiversity(groupCount, perGroup) {
    const totalNeeded = groupCount * perGroup;
    let attempts = 0;

    while (attempts < 1000) {
        const shuffled = shuffleArray([...windowEntries]);
        const groups = [];
        let valid = true;

        for (let i = 0; i < groupCount; i++) {
            const group = shuffled.slice(i * perGroup, (i + 1) * perGroup);
            groups.push(group);
        }

        // Ensure 80% of groups meet diversity condition
        const diverseGroups = groups.filter(groupHasDiversity);
        if (diverseGroups.length >= Math.floor(0.8 * groupCount)) {
            return groups;
        }

        attempts++;
    }

    alert("无法在多次尝试中生成满足条件的分组。");
    return null;
}

function startSpinning() {
    const groupCount = parseInt(document.getElementById('groupCount').value);
    const perGroup = parseInt(document.getElementById('perGroup').value);
    const totalNeeded = groupCount * perGroup;

    if (windowEntries.length < totalNeeded) {
        alert("样本数量不足，请检查 CSV 数据。");
        return;
    }

    spinning = true;
    spinInterval = setInterval(() => {
        const groups = generateGroupsWithDiversity(groupCount, perGroup);
        if (!groups) return;

        const output = document.getElementById('output');
        output.innerHTML = '';

        groups.forEach((group, i) => {
            const box = document.createElement('div');
            box.className = 'group-box spin-animate';
            box.innerHTML = `<strong>第 ${i + 1} 组</strong><ul>${
                group.map(p => `<li>${p.name} (${p.role}, ${p.level})</li>`).join('')
            }</ul>`;
            output.appendChild(box);
        });
    }, 100);
}

function stopSpinning() {
    spinning = false;
    clearInterval(spinInterval);
}
