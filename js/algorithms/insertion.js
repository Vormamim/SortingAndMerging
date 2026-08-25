/*
 * Step generator for Insertion Sort. Mirrors the Python implementation
 * shown on sorts/insertion-sort.html (same variable names: i, j, key).
 */
function insertionSortSteps(arr) {
  const a = arr.slice();
  const n = a.length;
  const steps = [];

  steps.push(mkStep(a, { i: null, j: null, key: null }, { sorted: n ? [0] : [] }, "start", `Initial array: [${a.join(", ")}]. arr[0] counts as a sorted list of one item.`));

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push(
      mkStep(
        a,
        { i, j, key },
        { key: [i], sorted: rangeArray(0, i) },
        "pick",
        `Pick key = arr[${i}] = ${key} to insert into the sorted part [${a.slice(0, i).join(", ")}]`
      )
    );
    while (j >= 0 && a[j] > key) {
      steps.push(
        mkStep(
          a,
          { i, j, key },
          { compare: [j], key: [j + 1], sorted: rangeArray(0, i) },
          "compare",
          `arr[${j}]=${a[j]} > key(${key}), so shift arr[${j}] right into position ${j + 1}`
        )
      );
      a[j + 1] = a[j];
      j -= 1;
      steps.push(
        mkStep(
          a,
          { i, j, key },
          { swap: [j + 1], sorted: rangeArray(0, i) },
          "shift",
          `Array after shift: [${a.join(", ")}]`
        )
      );
    }
    a[j + 1] = key;
    steps.push(
      mkStep(
        a,
        { i, j, key },
        { key: [j + 1], sorted: rangeArray(0, i + 1) },
        "insert",
        `Insert key(${key}) at position ${j + 1} -> [${a.join(", ")}]`
      )
    );
  }

  steps.push(mkStep(a, {}, { sorted: rangeArray(0, n) }, "done", `Array is sorted: [${a.join(", ")}]`));
  return steps;
}
