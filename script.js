function stopSpinning() {
  if (!spinning) return;

  clearInterval(spinInterval);
  spinning = false;

  const groupCount = parseInt(document.getElementById('groupCount').value);
  const perGroup = parseInt(document.getElementById('perGroup').value);
  const totalNeeded = groupCount * perGroup;

  let finalGroups = [];
  let attempt = 0;
  const maxAttempts = 1000;

  while (finalGroups.length < groupCount && attempt++ < maxAttempts) {
    const tempGroups = [];
    let usedIndices = new Set();
    let success = true;

    for (let g = 0; g < groupCount; g++) {
      let group = [];

      // Step 1: Ensure first two members collectively cover all 4 traits
      let pairFound = false;

      const candidates = windowEntries.map((p, idx) => ({ ...p, idx }))
        .filter(p => !usedIndices.has(p.idx));

      for (let i = 0; i < candidates.length && !pairFound; i++) {
        for (let j = i + 1; j < candidates.length && !pairFound; j++) {
          const p1 = candidates[i], p2 = candidates[j];

          const hasDifferentRoles = (p1.role !== p2.role) &&
            ((p1.role === 'buyer' && p2.role === 'sourcing') || (p1.role === 'sourcing' && p2.role === 'buyer'));
          const hasDifferentLevels = (p1.level !== p2.level) &&
            ((p1.level === 'senior' && p2.level === 'junior') || (p1.level === 'junior' && p2.level === 'senior'));

          if (hasDifferentRoles && hasDifferentLevels) {
            group.push(p1, p2);
            usedIndices.add(p1.idx);
            usedIndices.add(p2.idx);
            pairFound = true;
          }
        }
      }

      if (!pairFound) {
        success = false;
        break;
      }

      // Step 2: Fill the remaining members with 0.8 switch logic
      let last = group[group.length - 1];
      while (group.length < perGroup) {
        let expectedRole = Math.random() < 0.8 ? (last.role === 'buyer' ? 'sourcing' : 'buyer') : last.role;
        let expectedLevel = Math.random() < 0.8 ? (last.level === 'junior' ? 'senior' : 'junior') : last.level;

        let candidates = windowEntries
          .map((p, idx) => ({ ...p, idx }))
          .filter(p => !usedIndices.has(p.idx) && p.role === expectedRole && p.level === expectedLevel);

        if (candidates.length === 0) {
          candidates = windowEntries
            .map((p, idx) => ({ ...p, idx }))
            .filter(p => !usedIndices.has(p.idx) && p.role === expectedRole);
        }

        if (candidates.length === 0) {
          candidates = windowEntries
            .map((p, idx) => ({ ...p, idx }))
            .filter(p => !usedIndices.has(p.idx));
        }

        if (candidates.length === 0) {
          success = false;
          break;
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        group.push(chosen);
        usedIndices.add(chosen.idx);
        last = chosen;
      }

      if (!success) break;

      tempGroups.push(group);
    }

    if (success) {
      finalGroups = tempGroups;
      break;
    }
  }

  if (finalGroups.length !== groupCount) {
    alert("生成分组失败，请检查样本数据是否足够多样。");
    return;
  }

  for (let i = 0; i < groupCount; i++) {
    for (let j = 0; j < perGroup; j++) {
      const li = document.getElementById(`g${i}-m${j}`);
      li.textContent = finalGroups[i][j]?.name || 'BLANK';
    }
  }
}
