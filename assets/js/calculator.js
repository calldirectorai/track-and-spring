/* Calculator. Ranges are computed from data/pricing/national.json, embedded in the page as JSON.
   Method: median of consumer-guide lows, median of consumer-guide highs. Nothing is invented here. */
(function () {
  var dataEl = document.getElementById("pricing-data");
  if (!dataEl) return;
  var data = JSON.parse(dataEl.textContent);

  function median(a) {
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function round5(n) { return Math.round(n / 5) * 5; }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  function rangeFor(job) {
    var src = (data.jobs[job] || { sources: [] }).sources.filter(function (s) { return s.type === "consumer-guide"; });
    if (!src.length) return null;
    return {
      low: round5(median(src.map(function (s) { return s.low; }))),
      high: round5(median(src.map(function (s) { return s.high; }))),
      n: src.length
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-calc]"), function (root) {
    var out = root.querySelector("[data-est-figure]");
    var text = root.querySelector("[data-est-text]");
    var conf = root.querySelector("[data-est-conf]");
    var jobIn = root.querySelectorAll("input[type=radio]");
    var doorsIn = root.querySelector("select[name=doors]");
    var hiddenJob = root.querySelector("input[name=job_label]");
    var hiddenDoors = root.querySelector("input[name=doors_count]");

    function update() {
      var job = "spring", label = "";
      Array.prototype.forEach.call(jobIn, function (i) { if (i.checked) { job = i.value; label = i.getAttribute("data-label"); } });
      var doors = doorsIn ? parseInt(doorsIn.value, 10) : 1;
      var r = rangeFor(job);
      if (!r) { out.textContent = "No range yet"; return; }
      var lo = r.low * doors, hi = r.high * doors;
      var forWhat = doors > 1 ? " for " + doors + " doors" : "";
      out.textContent = money(lo) + " to " + money(hi);
      text.textContent = label + forWhat + ": " + money(lo) + " to " + money(hi) + " (national estimate)";
      conf.textContent = r.n === 1
        ? "Based on 1 published guide. Treat this as a rough starting point."
        : "Median of the low and high ends from " + r.n + " published consumer guides.";
      if (hiddenJob) hiddenJob.value = label;
      if (hiddenDoors) hiddenDoors.value = String(doors);
    }
    Array.prototype.forEach.call(jobIn, function (i) { i.addEventListener("change", update); });
    if (doorsIn) doorsIn.addEventListener("change", update);
    var want = new URLSearchParams(location.search).get("job");
    if (want) Array.prototype.forEach.call(jobIn, function (i) { if (i.value === want) i.checked = true; });
    update();
  });
})();
