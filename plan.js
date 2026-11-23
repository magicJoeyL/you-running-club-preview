(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const plans = window.plans;
  const letters = ["A", "B", "C", "D"];
  const goals = ["2:50", "3:00", "3:15", "3:30"];
  const names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const types = ["恢复跑", "轻松跑", "质量课", "恢复跑", "轻松跑", "休息", "长距离"];
  const venues = { 2: "合练 · 宝安体育场", 6: "合练 · 大沙河" };
  const dayMS = 86_400_000;
  const start = Date.UTC(2026, 10, 16);
  const firstWeek = 2;
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" });
  const status = $("training-status");
  const query = new URLSearchParams(location.search);
  const pick = id => Array.from($(id).querySelectorAll("button"));
  const safe = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function localDay() {
    const fields = Object.fromEntries(fmt.formatToParts(new Date()).map(({ type, value }) => [type, value]));
    return Math.round((Date.UTC(+fields.year, +fields.month - 1, +fields.day) - start) / dayMS);
  }

  function dayDate(offset) {
    const iso = new Date(start + offset * dayMS).toISOString().slice(0, 10);
    return { iso, short: iso.slice(5).replace("-", ".") };
  }

  const weekDate = w => `${dayDate(w * 7).short}–${dayDate(w * 7 + 6).short}`;
  function readGroup() {
    try { return localStorage.getItem("youGroup"); } catch { return null; }
  }

  const initialGroup = letters.indexOf((query.get("group") || "").toUpperCase());
  let group = initialGroup >= 0 ? initialGroup : Math.max(0, letters.indexOf(readGroup()));
  const requestedWeek = Number(query.get("week")) - firstWeek;
  const currentWeek = Math.floor(localDay() / 7);
  let week = query.has("week") && Number.isInteger(requestedWeek) && requestedWeek >= 0 && requestedWeek < plans.length
    ? requestedWeek
    : Math.max(0, Math.min(plans.length - 1, currentWeek));
  let view = "all";

  function readWorkout(raw) {
    const pieces = raw.split(/\s*[＋+]\s*/);
    const parts = pieces.map(piece => {
      const m = piece.trim().match(/^(?:(\d+)\s*×\s*)?(\d+(?:\.\d+)?)\s*@\s*(\d+:\d{2})$/);
      return m ? { distance: m[1] ? `${m[1]} × ${m[2]}` : m[2], pace: m[3] } : null;
    });
    return parts.every(Boolean) ? parts : [];
  }

  function activePlan() {
    const p = plans[week][group];
    const wed = week === 0 ? "转段休 5 分钟；组间休 3 分钟。" : week === 3 ? "连续提速。" : "连续跑。";
    return {
      number: week + firstWeek, group: letters[group], goal: goals[group], range: weekDate(week), km: p.km,
      days: p.days.map((raw, i) => ({
        i, raw, ...dayDate(week * 7 + i), name: names[i], type: types[i], venue: venues[i],
        parts: readWorkout(raw), note: i === 2 ? wed : "", rest: raw === "休息"
      }))
    };
  }

  function setStatus(message = "") {
    status.hidden = !message;
    status.textContent = message;
  }

  function formatContent(day) {
    if (!day.parts.length) return `<strong class="training-rest">${safe(day.rest ? "不安排跑步" : day.raw)}</strong>`;
    return `<div class="training-parts">${day.parts.map(part => `<span class="training-part"><strong>${part.distance}<span class="training-unit"> km</span></strong><span class="training-pace">${part.pace}<small> /km</small></span></span>`).join('<span class="training-plus" aria-label="加">＋</span>')}</div>`;
  }

  $("groups").innerHTML = letters.map((letter, i) => `<button type="button" aria-label="${letter}组，全马目标 ${goals[i]}"><strong>${letter} 组</strong><small>${goals[i]}</small></button>`).join("");
  $("weeks").innerHTML = plans.map((_, i) => `<button type="button"><strong>W${i + firstWeek}</strong><small>${weekDate(i)}</small></button>`).join("");
  const groups = pick("groups"), weeks = pick("weeks");

  function render() {
    const p = activePlan();
    groups.forEach((button, i) => button.setAttribute("aria-pressed", String(i === group)));
    weeks.forEach((button, i) => button.setAttribute("aria-pressed", String(i === week)));
    $("total").innerHTML = `<div class="training-score-top"><strong>${p.group} 组 / W${p.number}</strong><span>${p.range}</span></div><div class="training-score-body"><b class="training-score-number">${p.km}<small> km</small></b><span class="training-score-label">周跑量</span></div>`;
    $("program-context").textContent = `${p.group} 组 · W${p.number} · ${p.range}`;
    const today = localDay();
    const visible = view === "today" ? p.days.filter(d => week * 7 + d.i === today) : p.days;
    $("days").innerHTML = visible.map(d => `<li class="training-day${d.venue ? " is-key" : ""}" data-day="${d.i}">
      <div class="training-day-name"><b>${d.name}</b><time datetime="${d.iso}">${d.short}</time></div>
      <div class="training-day-type"><b>${d.type}</b>${d.venue ? `<small>${d.venue}</small>` : ""}</div>
      <div class="training-day-content">${formatContent(d)}${d.note ? `<p class="training-note">${d.note}</p>` : ""}</div></li>`).join("");
    $("all").setAttribute("aria-pressed", String(view === "all"));
    $("today").setAttribute("aria-pressed", String(view === "today"));
    query.set("group", p.group);
    query.set("week", String(p.number));
    try { history.replaceState(null, "", `?${query}${location.hash}`); } catch { /* static file fallback */ }
  }

  groups.forEach((button, i) => button.addEventListener("click", () => {
    group = i;
    try { localStorage.setItem("youGroup", letters[i]); } catch { /* storage may be disabled */ }
    setStatus();
    render();
  }));
  weeks.forEach((button, i) => button.addEventListener("click", () => {
    week = i;
    view = "all";
    setStatus();
    render();
  }));
  $("all").onclick = () => { view = "all"; setStatus(); render(); };
  $("today").onclick = () => {
    const date = localDay();
    const active = Math.floor(date / 7);
    if (active < 0 || active >= plans.length) {
      view = "all";
      setStatus("今天不在已发布的训练周期内，以下仍显示所选周次。");
    } else {
      week = active;
      view = "today";
      setStatus();
    }
    render();
  };

  function drawPoster(p, withLogo) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1440;
    const c = canvas.getContext("2d");
    const red = "#c8102e", ink = "#161616", muted = "#564e4c", line = "#e5ddd9", wash = "#f8f3f0";
    const font = '"Microsoft YaHei","PingFang SC","Noto Sans CJK SC","Noto Sans SC",sans-serif';
    const text = (value, x, y, size, color = ink, weight = 600, maxWidth) => {
      c.fillStyle = color;
      c.font = `${weight} ${size}px ${font}`;
      if (maxWidth) c.fillText(value, x, y, maxWidth);
      else c.fillText(value, x, y);
    };
    const fill = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
    const rule = (x, y, w, color = line) => fill(x, y, w, 2, color);
    fill(0, 0, 1080, 1440, "#fdfbfa");
    fill(0, 0, 1080, 10, red);
    c.textBaseline = "alphabetic";
    if (withLogo && $("plan-logo").naturalWidth) {
      const logo = $("plan-logo");
      const height = 68;
      c.drawImage(logo, 56, 32, height * logo.naturalWidth / logo.naturalHeight, height);
    } else {
      text("YOU 跑团", 56, 82, 38, ink, 900);
    }
    c.textAlign = "right";
    text("深圳 YOU 跑团  /  2026–27 冬训", 1024, 79, 22, muted, 650);
    c.textAlign = "left";

    fill(56, 127, 968, 257, red);
    c.save();
    c.beginPath(); c.rect(800, 127, 224, 257); c.clip();
    c.strokeStyle = "#ffffff36"; c.lineWidth = 2;
    for (let x = 814; x < 1230; x += 19) {
      c.beginPath(); c.moveTo(x, 127); c.lineTo(x - 160, 384); c.stroke();
    }
    c.restore();
    text(`W${p.number}  /  ${p.range}`, 82, 185, 33, "#fff", 750);
    text("冬训课表", 80, 274, 78, "#fff", 900);
    text(`${p.group} 组  ·  全马目标 ${p.goal}`, 85, 339, 28, "#fff", 650);
    fill(665, 193, 2, 130, "#ffffff73");
    c.textAlign = "right";
    text(`${p.km}`, 917, 264, 83, "#fff", 900);
    text("KM", 987, 264, 31, "#fff", 800);
    text("周跑量 · 含热身与放松", 985, 312, 23, "#fff", 600);
    c.textAlign = "left";

    text("日期", 74, 431, 22, muted, 750);
    text("课型", 206, 431, 22, muted, 750);
    text("训练内容", 408, 431, 22, muted, 750);
    rule(56, 449, 968, ink);
    let y = 451;
    for (const d of p.days) {
      const height = d.i === 2 ? 143 : 114;
      if (d.venue) { fill(56, y, 968, height, wash); fill(56, y, 6, height, red); }
      text(d.name, 74, y + 45, 30, ink, 800);
      text(d.short, 74, y + 80, 22, muted, 550);
      text(d.type, 206, y + 45, 28, d.venue ? red : ink, 780);
      if (d.venue) text(d.i === 2 ? "宝安体育场" : "大沙河", 206, y + 79, 22, muted, 550);
      if (!d.parts.length) {
        text(d.rest ? "不安排跑步" : d.raw, 408, y + 57, 28, muted, 600, 585);
      } else {
        const slot = 602 / d.parts.length;
        d.parts.forEach((part, i) => {
          const x = 408 + i * slot;
          if (i) text("+", x - 31, y + 51, 25, muted, 650);
          text(`${part.distance} km`, x, y + 48, 39, ink, 850, slot - 40);
          text(`${part.pace} /km`, x, y + 86, 25, muted, 700);
        });
      }
      if (d.note) text(d.note, 408, y + 121, 22, muted, 550, 590);
      y += height;
      rule(56, y - 2, 968);
    }
    text("周三另加 3 公里热身、2 公里放松；组间静止或步行。", 56, 1347, 23, muted, 550, 968);
    rule(56, 1374, 968, ink);
    text("BE A BETTER YOU", 56, 1410, 23, ink, 800);
    c.textAlign = "right";
    text("YOU 跑团  /  每周训练卡", 1024, 1410, 22, muted, 650);
    return canvas;
  }

  const download = $("download");
  const toPNG = canvas => new Promise((resolve, reject) => {
    try { canvas.toBlob(b => b ? resolve(b) : reject(Error("PNG unavailable")), "image/png"); }
    catch (e) { reject(e); }
  });
  download.onclick = async () => {
    const p = activePlan();
    download.disabled = true;
    setStatus();
    try {
      await document.fonts?.ready;
      let blob;
      try { blob = await toPNG(drawPoster(p, true)); }
      catch { blob = await toPNG(drawPoster(p, false)); }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `YOU冬训-${p.group}组-W${p.number}.png`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
    } catch {
      setStatus("下载没完成，请重试。");
    } finally {
      download.disabled = false;
    }
  };

  render();
})();
