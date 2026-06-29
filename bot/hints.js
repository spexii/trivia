export function buildHintMask(answer) {
  const nonSpaceIndices = [];
  for (let i = 0; i < answer.length; i++) {
    if (answer[i] !== ' ') nonSpaceIndices.push(i);
  }
  const shuffled = shuffle([...nonSpaceIndices]);
  const count1 = Math.max(1, Math.floor(nonSpaceIndices.length * 0.3));
  const count2 = Math.max(2, Math.floor(nonSpaceIndices.length * 0.6));
  return {
    hint1Indices: new Set(shuffled.slice(0, count1)),
    hint2Indices: new Set(shuffled.slice(0, count2)),
  };
}

export function applyHint(answer, revealedIndices) {
  return answer
    .split('')
    .map((c, i) => {
      if (c === ' ') return ' ';
      return revealedIndices.has(i) ? c : '*';
    })
    .join('');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
