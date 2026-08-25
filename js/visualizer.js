/*
 * Shared desk-check / visualizer engine used by every sort page.
 * Each algorithm file (js/algorithms/*.js) exposes a pure function
 *   stepsFor(array) -> [ step, ... ]
 * where a step looks like:
 *   {
 *     array: [..],                     // full snapshot at this point
 *     vars: { i: 2, j: null, key: 5 }, // values shown as chips + trace columns
 *     highlight: {                     // index -> css class name
 *       compare: [i, j], swap: [i, j], key: [i],
 *       sorted: [i, ...], rangeA: [start, end], rangeB: [start, end]
 *     },
 *     action: "compare" | "swap" | ...,
 *     description: "human readable sentence"
 *   }
 * initVisualizer(config) wires that up to the DOM controls.
 */

function mkStep(array, vars, highlight, action, description) {
  return { array: array.slice(), vars: Object.assign({}, vars), highlight: highlight || {}, action, description };
}

function rangeArray(lo, hi) {
  const r = [];
  for (let x = lo; x < hi; x++) r.push(x);
  return r;
}

function initVisualizer(config) {
  const root = typeof config.root === "string" ? document.getElementById(config.root) : config.root;
  const varNames = config.varNames || [];
  const defaultArray = config.defaultArray || [8, 3, 5, 4, 7, 6, 1, 2];
  const algorithmFn = config.algorithmFn;

  root.innerHTML = `
    <div class="viz-controls">
      <label>Array: <input type="text" class="viz-input" value="${defaultArray.join(",")}"></label>
      <button class="viz-apply">Set array</button>
      <button class="viz-random">Randomise</button>
      <button class="viz-reset">Reset</button>
      <span class="spacer"></span>
      <button class="viz-prev">&#9664; Prev</button>
      <button class="viz-play primary">&#9654; Play</button>
      <button class="viz-next">Next &#9654;</button>
      <label>Speed <input type="range" class="viz-speed" min="1" max="10" value="6"></label>
      <span class="step-counter viz-counter">Step 0 / 0</span>
    </div>
    <div class="viz-array"></div>
    <div class="viz-vars"></div>
    <p class="viz-description">Press "Next" or "Play" to begin the desk check.</p>
    <div class="viz-trace-wrap">
      <table class="viz-trace">
        <thead><tr>
          <th>Step</th>
          ${varNames.map((v) => `<th>${v}</th>`).join("")}
          <th>Action</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  const els = {
    input: root.querySelector(".viz-input"),
    apply: root.querySelector(".viz-apply"),
    random: root.querySelector(".viz-random"),
    reset: root.querySelector(".viz-reset"),
    prev: root.querySelector(".viz-prev"),
    play: root.querySelector(".viz-play"),
    next: root.querySelector(".viz-next"),
    speed: root.querySelector(".viz-speed"),
    counter: root.querySelector(".viz-counter"),
    array: root.querySelector(".viz-array"),
    vars: root.querySelector(".viz-vars"),
    description: root.querySelector(".viz-description"),
    traceBody: root.querySelector(".viz-trace tbody"),
  };

  let steps = [];
  let current = 0;
  let playing = false;
  let timer = null;

  function parseArrayInput(text) {
    const nums = text
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    return nums.length ? nums : defaultArray.slice();
  }

  function loadArray(arr) {
    stop();
    steps = algorithmFn(arr.slice());
    current = 0;
    els.traceBody.innerHTML = "";
    steps.forEach((step, i) => {
      const row = document.createElement("tr");
      row.dataset.step = String(i);
      row.innerHTML = `
        <td>${i}</td>
        ${varNames.map((v) => `<td>${step.vars && step.vars[v] !== undefined && step.vars[v] !== null ? step.vars[v] : ""}</td>`).join("")}
        <td>${step.description}</td>
      `;
      els.traceBody.appendChild(row);
    });
    render();
  }

  function render() {
    const step = steps[current] || { array: [], vars: {}, highlight: {}, description: "" };
    const hl = step.highlight || {};
    const cls = new Map();
    const mark = (list, name) => (list || []).forEach((i) => cls.set(i, [...(cls.get(i) || []), name]));
    mark(hl.sorted, "sorted");
    mark(hl.rangeA, "range-a-fill");
    mark(hl.rangeB, "range-b-fill");
    mark(hl.compare, "compare");
    mark(hl.key, "key");
    mark(hl.swap, "swap");

    els.array.innerHTML = (step.array || [])
      .map((val, i) => {
        const classes = ["viz-box", ...(cls.get(i) || [])].join(" ");
        const tag =
          (hl.key || []).includes(i) && varNames.includes("key")
            ? "key"
            : (hl.swap || []).includes(i)
            ? "swap"
            : "";
        return `<div class="${classes}">${tag ? `<span class="tags">${tag}</span>` : ""}${val}<span class="idx">${i}</span></div>`;
      })
      .join("");

    els.vars.innerHTML = varNames
      .map((v) => {
        const val = step.vars && step.vars[v] !== undefined && step.vars[v] !== null ? step.vars[v] : "–";
        return `<span class="var-chip">${v} = <b>${val}</b></span>`;
      })
      .join("");

    els.description.textContent = step.description || "";
    els.counter.textContent = `Step ${steps.length ? current : 0} / ${Math.max(steps.length - 1, 0)}`;

    els.traceBody.querySelectorAll("tr").forEach((row) => row.classList.remove("current"));
    const activeRow = els.traceBody.querySelector(`tr[data-step="${current}"]`);
    if (activeRow) {
      activeRow.classList.add("current");
      activeRow.scrollIntoView({ block: "nearest" });
    }

    els.prev.disabled = current <= 0;
    els.next.disabled = current >= steps.length - 1;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    render();
    if (current >= steps.length - 1) stop();
  }

  function stop() {
    playing = false;
    els.play.innerHTML = "&#9654; Play";
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function play() {
    if (current >= steps.length - 1) goTo(0);
    playing = true;
    els.play.innerHTML = "&#10074;&#10074; Pause";
    const speed = 11 - Number(els.speed.value);
    timer = setInterval(() => {
      if (current >= steps.length - 1) {
        stop();
        return;
      }
      goTo(current + 1);
    }, speed * 220);
  }

  els.apply.addEventListener("click", () => loadArray(parseArrayInput(els.input.value)));
  els.reset.addEventListener("click", () => loadArray(parseArrayInput(els.input.value)));
  els.random.addEventListener("click", () => {
    const size = 6 + Math.floor(Math.random() * 5);
    const arr = Array.from({ length: size }, () => 1 + Math.floor(Math.random() * 40));
    els.input.value = arr.join(",");
    loadArray(arr);
  });
  els.prev.addEventListener("click", () => {
    stop();
    goTo(current - 1);
  });
  els.next.addEventListener("click", () => {
    stop();
    goTo(current + 1);
  });
  els.play.addEventListener("click", () => (playing ? stop() : play()));
  els.speed.addEventListener("change", () => {
    if (playing) {
      stop();
      play();
    }
  });

  loadArray(defaultArray.slice());
}
