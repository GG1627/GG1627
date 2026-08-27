import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = (await readFile(resolve(root, "profile/profile.json"), "utf8"))
  .replaceAll("\r\n", "\n");
const profile = JSON.parse(source);
const build = createHash("sha256").update(source).digest("hex").slice(0, 7);

const color = {
  paper: "#f2ead7",
  paperLight: "#fffaf0",
  ink: "#182033",
  fadedInk: "#596174",
  grid: "#cec5b2",
  coral: "#ff765b",
  violet: "#9d8cff",
  cyan: "#5dd8cc",
  lime: "#d8ff64",
  yellow: "#f4cf62",
  blue: "#3e63dd"
};

const seedBase = Number.parseInt(build, 16);
let seed = seedBase || 1627;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const wobble = (amount = 2) => ((random() * 2 - 1) * amount).toFixed(2);

const xml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const doublePath = (d, stroke = color.ink, width = 2) => `
  <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" transform="translate(${wobble(1.3)} ${wobble(1.3)})" fill="none" stroke="${stroke}" stroke-width="0.7" stroke-opacity="0.48" stroke-linecap="round" stroke-linejoin="round"/>`;

const roughRect = ({ x, y, width, height, fill, rotate = 0 }) => `
  <g transform="rotate(${rotate} ${x + width / 2} ${y + height / 2})">
    <path d="M${x + 3} ${y} L${x + width - 4} ${y + 2} L${x + width} ${y + height - 4} L${x + 5} ${y + height} Z" fill="${color.ink}" opacity="0.16" transform="translate(5 6)"/>
    <path d="M${x + 3} ${y} L${x + width - 4} ${y + 2} L${x + width} ${y + height - 4} L${x + 5} ${y + height} Z" fill="${fill}" stroke="${color.ink}" stroke-width="1.6" filter="url(#rough)"/>
  </g>`;

const projectPositions = [
  { x: 710, y: 132, width: 390, height: 112, rotate: 1.1 },
  { x: 655, y: 286, width: 350, height: 108, rotate: -1.7 },
  { x: 800, y: 432, width: 330, height: 108, rotate: 1.4 }
];

const projectNotes = profile.projects.map((project, index) => {
  const position = projectPositions[index];
  const [lineOne, lineTwo = ""] = project.description.split(" / ");
  const accent = color[project.accent];
  const { x, y, width, height, rotate } = position;
  return `<g transform="rotate(${rotate} ${x + width / 2} ${y + height / 2})">
    <path d="M${x + 3} ${y} L${x + width - 5} ${y + 2} L${x + width} ${y + height - 5} L${x + 4} ${y + height} Z" fill="${accent}" stroke="${color.ink}" stroke-width="1.7" filter="url(#rough)"/>
    <rect x="${x + width / 2 - 38}" y="${y - 9}" width="76" height="19" fill="${color.paperLight}" fill-opacity="0.72" transform="rotate(${wobble(3)} ${x + width / 2} ${y})"/>
    <text x="${x + 22}" y="${y + 40}" class="sans project" fill="${color.ink}">${xml(project.name)}</text>
    <text x="${x + 23}" y="${y + 67}" class="mono small" fill="${color.ink}">${xml(lineOne)}</text>
    <text x="${x + 23}" y="${y + 86}" class="mono small" fill="${color.ink}">${xml(lineTwo)}</text>
    <text x="${x + width - 18}" y="${y + 25}" text-anchor="end" class="mono tiny" fill="${color.ink}">OUTPUT / 0${index + 1}</text>
  </g>`;
}).join("\n");

const techPalette = [color.lime, color.coral, color.violet, color.cyan];
const techStickers = profile.technologies.map((technology, index) => {
  const x = 48 + index * 138;
  const y = 635 + Number(wobble(5));
  const rotation = Number(wobble(3.4));
  const fill = techPalette[index % techPalette.length];
  return `<g transform="rotate(${rotation} ${x + 55} ${y + 21})">
    <path d="M${x + 2} ${y} L${x + 110} ${y + 2} L${x + 108} ${y + 40} L${x} ${y + 38} Z" fill="${fill}" stroke="${color.ink}" stroke-width="1.4"/>
    <text x="${x + 55}" y="${y + 26}" text-anchor="middle" class="mono sticker" fill="${color.ink}">${xml(technology)}</text>
  </g>`;
}).join("\n");

const sketchbook = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">${xml(profile.name)} — source-controlled engineering sketchbook</title>
  <desc id="desc">An imperfectly drawn software sketchbook showing Gael's source, experience, projects, and tools.</desc>
  <defs>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1" fill="${color.grid}" fill-opacity="0.62"/>
    </pattern>
    <filter id="rough" x="-4%" y="-4%" width="108%" height="108%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seedBase % 97}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.25"/>
    </filter>
    <style>
      .sans { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .mono { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
      .hand { font-family: "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive; }
      .tiny { font-size: 10px; letter-spacing: 1px; }
      .small { font-size: 12px; }
      .code { font-size: 15px; }
      .project { font-size: 28px; font-weight: 850; letter-spacing: -1px; }
      .sticker { font-size: 12px; font-weight: 800; }
      .dash { stroke-dasharray: 7 10; animation: travel 5s linear infinite; }
      .blink { animation: blink 1.1s steps(1) infinite; }
      @keyframes travel { to { stroke-dashoffset: -68; } }
      @keyframes blink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
    </style>
  </defs>

  <rect x="1" y="1" width="1198" height="718" rx="4" fill="${color.paper}" stroke="${color.ink}" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="718" rx="4" fill="url(#dots)"/>
  <path d="M600 18C596 122 605 221 599 330C594 441 606 556 600 701" fill="none" stroke="${color.grid}" stroke-width="2"/>
  <path d="M603 18C599 122 608 221 602 330C597 441 609 556 603 701" fill="none" stroke="#ffffff" stroke-opacity="0.55"/>

  <!-- Masthead, deliberately misregistered -->
  <text x="42" y="45" class="mono tiny" fill="${color.fadedInk}">WORKING TREE / ${xml(profile.handle)} / BUILD ${build}</text>
  <text x="1155" y="45" text-anchor="end" class="hand" font-size="13" fill="${color.blue}" transform="rotate(-2 1155 45)">not final on purpose</text>
  <path d="M1004 50C1050 57 1105 55 1159 49" fill="none" stroke="${color.blue}" stroke-width="1.5"/>

  <g class="sans" font-weight="900" font-size="104" fill="${color.ink}">
    <text x="40" y="146" transform="rotate(-2 40 146)">G</text>
    <text x="119" y="146" transform="rotate(1.5 119 146)">A</text>
    <text x="196" y="146" transform="rotate(-1 196 146)">E</text>
    <text x="262" y="146" transform="rotate(2 262 146)">L</text>
  </g>
  <rect x="42" y="157" width="296" height="17" fill="${color.lime}" transform="rotate(-1 42 157)"/>
  <text x="48" y="173" class="mono" font-size="13" font-weight="800" fill="${color.ink}">SOFTWARE ENGINEER / MAKES THINGS MOVE</text>

  <!-- Source slip -->
  ${roughRect({ x: 42, y: 205, width: 490, height: 294, fill: color.paperLight, rotate: -0.8 })}
  <g transform="rotate(-0.8 287 352)">
    <rect x="232" y="194" width="110" height="25" fill="${color.yellow}" fill-opacity="0.68" transform="rotate(2 287 206)"/>
    <text x="65" y="238" class="mono tiny" fill="${color.fadedInk}">gael.ts / MODIFIED</text>
    <path d="M64 252H508" stroke="${color.grid}"/>

    <g class="mono code" fill="${color.ink}" xml:space="preserve">
      <text x="66" y="285"><tspan fill="${color.violet}">const</tspan> gael = {</text>
      <text x="66" y="318">  studies: <tspan fill="${color.blue}">"CE + AI @ UF"</tspan>,</text>
      <text x="66" y="351">  minor: <tspan fill="${color.blue}">"mathematics"</tspan>,</text>
      <text x="66" y="384">  previously: <tspan fill="${color.blue}">"SWE @ Visa"</tspan>,</text>
      <text x="66" y="417">  builds: [<tspan fill="${color.blue}">"AI"</tspan>, <tspan fill="${color.blue}">"products"</tspan>],</text>
      <text x="66" y="450">  status: <tspan fill="${color.blue}">"still compiling"</tspan>,</text>
      <text x="66" y="483">};</text>
      <rect x="92" y="462" width="8" height="22" fill="${color.coral}" class="blink"/>
    </g>

    <text x="354" y="356" class="hand" font-size="13" fill="${color.coral}" transform="rotate(-4 354 356)">learned a lot here</text>
    ${doublePath("M352 360C335 367 319 372 300 374", color.coral, 1.4)}
    <text x="350" y="465" class="hand" font-size="14" fill="${color.blue}" transform="rotate(2 350 465)">this is a feature.</text>
  </g>

  <!-- Issue ticket -->
  <g transform="rotate(1.8 286 542)">
    <path d="M48 505H520V579H48Z" fill="${color.cyan}" stroke="${color.ink}" stroke-width="1.7" filter="url(#rough)"/>
    <path d="M145 505V579" stroke="${color.ink}" stroke-dasharray="4 5"/>
    <text x="68" y="530" class="mono tiny" fill="${color.ink}">ISSUE</text>
    <text x="68" y="559" class="sans" font-size="24" font-weight="900" fill="${color.ink}">#1627</text>
    <text x="169" y="533" class="sans" font-size="17" font-weight="800" fill="${color.ink}">make ambitious ideas real</text>
    <text x="169" y="558" class="mono small" fill="${color.ink}">OPEN / LABELS: CURIOSITY, SHIP-IT</text>
  </g>

  <!-- Hand-routed project flow -->
  <text x="665" y="91" class="hand" font-size="24" fill="${color.ink}" transform="rotate(-2 665 91)">things that escaped localhost</text>
  ${doublePath("M526 340C612 331 638 196 708 187", color.ink, 2)}
  ${doublePath("M526 354C596 361 615 345 655 341", color.ink, 2)}
  ${doublePath("M526 370C642 423 691 480 800 483", color.ink, 2)}
  <g fill="none" stroke="${color.coral}" stroke-width="2" class="dash">
    <path d="M526 340C612 331 638 196 708 187"/>
    <path d="M526 354C596 361 615 345 655 341"/>
    <path d="M526 370C642 423 691 480 800 483"/>
  </g>
  <rect x="548" y="273" width="178" height="25" fill="${color.yellow}" fill-opacity="0.78" transform="rotate(-4 637 285)"/>
  <text x="555" y="291" class="hand" font-size="14" fill="${color.ink}" transform="rotate(-4 555 291)">somehow, this compiles →</text>
  ${projectNotes}

  <text x="1030" y="566" class="hand" font-size="13" fill="${color.blue}" transform="rotate(3 1030 566)">more in /projects</text>
  ${doublePath("M1027 570C1056 578 1085 578 1118 568", color.blue, 1.4)}

  <!-- Tool stickers -->
  <text x="42" y="607" class="mono tiny" fill="${color.fadedInk}">THINGS FOUND IN THE WORKING TREE</text>
  ${techStickers}

  <text x="42" y="704" class="mono tiny" fill="${color.fadedInk}">imperfections: deterministic</text>
  <text x="1158" y="704" text-anchor="end" class="mono tiny" fill="${color.fadedInk}">0 ERRORS / SEVERAL QUESTIONABLE IDEAS</text>
</svg>`;

const button = ({ label, fill, tilt, mark }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="238" height="60" viewBox="0 0 238 60" role="img" aria-label="${xml(label)}">
  <style>.sans{font-family:Inter,ui-sans-serif,system-ui,sans-serif}.mono{font-family:Consolas,monospace}</style>
  <g transform="rotate(${tilt} 119 30)">
    <path d="M5 6L232 3L235 53L3 56Z" fill="#182033" opacity="0.18" transform="translate(2 3)"/>
    <path d="M5 3L232 5L235 53L3 56Z" fill="${fill}" stroke="${color.ink}" stroke-width="1.8"/>
    <text x="24" y="36" class="mono" font-size="17" font-weight="900" fill="${color.ink}">${mark}</text>
    <text x="61" y="36" class="sans" font-size="12" font-weight="850" letter-spacing="1.5" fill="${color.ink}">${xml(label)}</text>
    <text x="214" y="37" text-anchor="end" class="mono" font-size="18" fill="${color.ink}">↗</text>
  </g>
</svg>`;

const outputs = [
  ["images/profile-sketchbook.svg", sketchbook],
  ["images/projects-button-sketch.svg", button({ label: "OPEN /PROJECTS", fill: color.lime, tilt: -1.1, mark: "{}" })],
  ["images/linkedin-button-sketch.svg", button({ label: "LINKEDIN", fill: color.violet, tilt: 1.2, mark: "in" })]
];

for (const [relativePath, contents] of outputs) {
  const destination = resolve(root, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${contents}\n`, "utf8");
}

console.log(`sketchbook artifacts generated from build ${build}`);
