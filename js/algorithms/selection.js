/*
 * Step generator for Selection Sort. Mirrors the Python implementation
 * shown on sorts/selection-sort.html (same variable names: i, j, min_index).
 */
function selectionSortSteps(arr) {
  const a = arr.slice();
  const n = a.length;
  const steps = [];
  const sortedIdx = [];

  steps.push(mkStep(a, { i: null, j: null, min_index: null }, {}, "start", `Initial array: [${a.join(", ")}]`));

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    steps.push(
      mkStep(
        a,
        { i, j: null, min_index: minIndex },
        { key: [minIndex], sorted: sortedIdx.slice() },
        "select",
        `Assume arr[${i}]=${a[i]} is the smallest remaining value.`
      )
    );
    for (let j = i + 1; j < n; j++) {
      steps.push(
        mkStep(
          a,
          { i, j, min_index: minIndex },
          { compare: [j, minIndex], key: [minIndex], sorted: sortedIdx.slice() },
          "compare",
          `Compare arr[${j}]=${a[j]} with current minimum arr[${minIndex}]=${a[minIndex]}`
        )
      );
      if (a[j] < a[minIndex]) {
        minIndex = j;
        steps.push(
          mkStep(
            a,
            { i, j, min_index: minIndex },
            { key: [minIndex], sorted: sortedIdx.slice() },
            "new-min",
            `arr[${j}]=${a[j]} is smaller. New minimum index is ${minIndex}.`
          )
        );
      }
    }
    if (minIndex !== i) {
      const tmp = a[i];
      a[i] = a[minIndex];
      a[minIndex] = tmp;
      steps.push(
        mkStep(
          a,
          { i, j: null, min_index: minIndex },
          { swap: [i, minIndex], sorted: sortedIdx.slice() },
          "swap",
          `Swap arr[${i}] and arr[${minIndex}] -> [${a.join(", ")}]`
        )
      );
    }
    sortedIdx.push(i);
    steps.push(
      mkStep(
        a,
        { i, j: null, min_index: minIndex },
        { sorted: sortedIdx.slice() },
        "pass-end",
        `Pass ${i + 1} complete. arr[${i}]=${a[i]} is now in its final position.`
      )
    );
  }

  steps.push(mkStep(a, {}, { sorted: rangeArray(0, n) }, "done", `Array is sorted: [${a.join(", ")}]`));
  return steps;
}
