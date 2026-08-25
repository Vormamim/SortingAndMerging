/*
 * Step generator for Bubble Sort. Mirrors the Python implementation shown
 * on sorts/bubble-sort.html exactly (same variable names, same 0-based
 * indices, same early-exit optimisation).
 */
function bubbleSortSteps(arr) {
  const a = arr.slice();
  const n = a.length;
  const steps = [];
  const sortedIdx = [];

  steps.push(mkStep(a, { i: null, j: null, swapped: null }, {}, "start", `Initial array: [${a.join(", ")}]`));

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push(
        mkStep(
          a,
          { i, j, swapped },
          { compare: [j, j + 1], sorted: sortedIdx.slice() },
          "compare",
          `Compare arr[${j}]=${a[j]} and arr[${j + 1}]=${a[j + 1]}`
        )
      );
      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
        swapped = true;
        steps.push(
          mkStep(
            a,
            { i, j, swapped },
            { swap: [j, j + 1], sorted: sortedIdx.slice() },
            "swap",
            `arr[${j}] > arr[${j + 1}], so swap them -> [${a.join(", ")}]`
          )
        );
      }
    }
    sortedIdx.push(n - 1 - i);
    steps.push(
      mkStep(
        a,
        { i, j: null, swapped },
        { sorted: sortedIdx.slice() },
        "pass-end",
        `Pass ${i + 1} complete. arr[${n - 1 - i}]=${a[n - 1 - i]} is now in its final position.`
      )
    );
    if (!swapped) {
      steps.push(
        mkStep(
          a,
          { i, j: null, swapped },
          { sorted: rangeArray(0, n) },
          "early-exit",
          "No swaps made during this pass, so the array is already sorted. Stop early."
        )
      );
      break;
    }
  }

  steps.push(mkStep(a, {}, { sorted: rangeArray(0, n) }, "done", `Array is sorted: [${a.join(", ")}]`));
  return steps;
}
