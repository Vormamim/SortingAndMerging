/*
 * Step generator for Merge Sort. Visualises the classic two-array
 * recursive version (mirrored in the Python on sorts/merge-sort.html)
 * against index ranges [lo, hi) of the single original array, so the
 * boxes on screen never need to change size or position.
 */
function mergeSortSteps(arr) {
  const a = arr.slice();
  const n = a.length;
  const steps = [];

  steps.push(mkStep(a, {}, {}, "start", `Initial array: [${a.join(", ")}]`));

  function sort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    steps.push(
      mkStep(
        a,
        { lo, mid, hi, i: null, j: null, k: null },
        { rangeA: [lo, mid - 1], rangeB: [mid, hi - 1] },
        "divide",
        `Divide arr[${lo}..${hi - 1}] into left=arr[${lo}..${mid - 1}] and right=arr[${mid}..${hi - 1}]`
      )
    );
    sort(lo, mid);
    sort(mid, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;

    steps.push(
      mkStep(
        a,
        { lo, mid, hi, i, j, k },
        { rangeA: [lo, mid - 1], rangeB: [mid, hi - 1] },
        "merge-start",
        `Merge left=[${left.join(", ")}] and right=[${right.join(", ")}] back into arr[${lo}..${hi - 1}]`
      )
    );

    while (i < left.length && j < right.length) {
      steps.push(
        mkStep(
          a,
          { lo, mid, hi, i, j, k },
          { compare: [lo + i, mid + j], rangeA: [lo, mid - 1], rangeB: [mid, hi - 1] },
          "compare",
          `Compare left[${i}]=${left[i]} and right[${j}]=${right[j]}`
        )
      );
      if (left[i] <= right[j]) {
        a[k] = left[i];
        steps.push(
          mkStep(
            a,
            { lo, mid, hi, i, j, k },
            { swap: [k], rangeA: [lo, mid - 1], rangeB: [mid, hi - 1] },
            "place",
            `left[${i}]=${left[i]} <= right[${j}]=${right[j]}, so arr[${k}] = ${left[i]}`
          )
        );
        i += 1;
      } else {
        a[k] = right[j];
        steps.push(
          mkStep(
            a,
            { lo, mid, hi, i, j, k },
            { swap: [k], rangeA: [lo, mid - 1], rangeB: [mid, hi - 1] },
            "place",
            `right[${j}]=${right[j]} < left[${i}]=${left[i]}, so arr[${k}] = ${right[j]}`
          )
        );
        j += 1;
      }
      k += 1;
    }
    while (i < left.length) {
      a[k] = left[i];
      steps.push(
        mkStep(a, { lo, mid, hi, i, j, k }, { swap: [k] }, "place", `Copy remaining left[${i}]=${left[i]} into arr[${k}]`)
      );
      i += 1;
      k += 1;
    }
    while (j < right.length) {
      a[k] = right[j];
      steps.push(
        mkStep(a, { lo, mid, hi, i, j, k }, { swap: [k] }, "place", `Copy remaining right[${j}]=${right[j]} into arr[${k}]`)
      );
      j += 1;
      k += 1;
    }

    steps.push(
      mkStep(
        a,
        { lo, mid, hi, i: null, j: null, k: null },
        { sorted: rangeArray(lo, hi) },
        "merged",
        `arr[${lo}..${hi - 1}] is now merged and sorted: [${a.slice(lo, hi).join(", ")}]`
      )
    );
  }

  sort(0, n);
  steps.push(mkStep(a, {}, { sorted: rangeArray(0, n) }, "done", `Array is sorted: [${a.join(", ")}]`));
  return steps;
}
