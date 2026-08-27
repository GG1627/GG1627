import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "profile/profile.json");
const source = (await readFile(sourcePath, "utf8")).replaceAll("\r\n", "\n");
const profile = JSON.parse(source);
const build = createHash("sha256").update(source).digest("hex").slice(0, 7);

const palette = {
  bg: "#090a0d",
  panel: "#101217",
  panelAlt: "#151821",
  border: "#2a2e39",
  text: "#f4f0e6",
  muted: "#7d8392",
  lime: "#d5ff63",
  coral: "#ff765b",
  violet: "#9b8cff",
  cyan: "#63ddd0"
};

const xml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const techPositions = [
  [42, 505], [174, 505], [306, 505], [438, 505],
  [42, 543], [174, 543], [306, 543], [438, 543]
];

const techNodes = profile.technologies.map((technology, index) => {
  const [x, y] = techPositions[index];
  const color = index < 4 ? palette.lime : index < 6 ? palette.violet : palette.cyan;
  const width = Math.max(72, technology.length * 7.2 + 24);
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="28" rx="2" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="3" height="28" fill="${color}"/>
    <text x="13" y="18.5" class="mono tech" fill="${palette.text}">${xml(technology)}</text>
  </g>`;
}).join("\n");

const projectNodes = profile.projects.map((project, index) => {
  const positions = [[700, 370], [874, 370], [1048, 370]];
  const [x, y] = positions[index];
  const color = palette[project.accent];
  const [firstLine, secondLine = ""] = project.description.split(" / ");
  return `<g transform="translate(${x} ${y})">
    <rect width="142" height="72" rx="3" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="142" height="3" fill="${color}"/>
    <text x="14" y="29" class="sans project" fill="${palette.text}">${xml(project.name)}</text>
    <text x="14" y="49" class="mono detail" fill="${palette.muted}">${xml(firstLine)}</text>
    <text x="14" y="63" class="mono detail" fill="${palette.muted}">${xml(secondLine)}</text>
  </g>`;
}).join("\n");

const graph = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620" role="img" aria-labelledby="title desc">
  <title id="title">${xml(profile.name)} — generated software profile</title>
  <desc id="desc">A source-generated dependency graph connecting Gael's education and experience to his software projects.</desc>
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="#1a1d24" stroke-width="1"/>
    </pattern>
    <style>
      .sans { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .mono { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
      .tiny { font-size: 10px; letter-spacing: 1.2px; }
      .code { font-size: 15px; }
      .line { font-size: 12px; }
      .node { font-size: 13px; font-weight: 700; }
      .detail { font-size: 9px; }
      .project { font-size: 14px; font-weight: 750; }
      .tech { font-size: 10px; font-weight: 650; }
      .flow { stroke-dasharray: 5 9; animation: flow 5s linear infinite; }
      .caret { animation: blink 1.15s steps(1) infinite; }
      @keyframes flow { to { stroke-dashoffset: -70; } }
      @keyframes blink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
    </style>
  </defs>

  <rect x="1" y="1" width="1198" height="618" rx="8" fill="${palette.bg}" stroke="${palette.border}" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="618" rx="8" fill="url(#grid)"/>

  <!-- Editor header -->
  <rect x="1" y="1" width="1198" height="44" rx="8" fill="${palette.panel}"/>
  <path d="M1 44H1199M630 44V586" stroke="${palette.border}"/>
  <rect x="18" y="12" width="3" height="20" fill="${palette.lime}"/>
  <text x="34" y="28" class="mono tiny" fill="${palette.text}">~/gael/profile.graph.ts</text>
  <text x="1176" y="28" text-anchor="end" class="mono tiny" fill="${palette.muted}">GENERATED / BUILD ${build}</text>

  <!-- Source pane -->
  <g class="mono code" xml:space="preserve">
    <g fill="${palette.muted}" class="line" text-anchor="end">
      <text x="34" y="84">01</text><text x="34" y="116">02</text><text x="34" y="148">03</text>
      <text x="34" y="180">04</text><text x="34" y="212">05</text><text x="34" y="244">06</text>
      <text x="34" y="276">07</text><text x="34" y="308">08</text><text x="34" y="340">09</text>
      <text x="34" y="372">10</text><text x="34" y="404">11</text><text x="34" y="436">12</text>
    </g>

    <text x="54" y="84"><tspan fill="${palette.violet}">import</tspan><tspan fill="${palette.text}"> { engineer } </tspan><tspan fill="${palette.violet}">from</tspan><tspan fill="${palette.lime}"> "@human/curiosity"</tspan><tspan fill="${palette.text}">;</tspan></text>
    <text x="54" y="116"><tspan fill="${palette.violet}">import</tspan><tspan fill="${palette.text}"> { ce, ai } </tspan><tspan fill="${palette.violet}">from</tspan><tspan fill="${palette.lime}"> "@uf"</tspan><tspan fill="${palette.text}">;</tspan></text>
    <text x="54" y="148"><tspan fill="${palette.violet}">import</tspan><tspan fill="${palette.text}"> { experience } </tspan><tspan fill="${palette.violet}">from</tspan><tspan fill="${palette.lime}"> "@visa"</tspan><tspan fill="${palette.text}">;</tspan></text>

    <text x="54" y="212"><tspan fill="${palette.violet}">export const</tspan><tspan fill="${palette.cyan}"> gael</tspan><tspan fill="${palette.text}"> = engineer({</tspan></text>
    <text x="54" y="244"><tspan fill="${palette.text}">  role: </tspan><tspan fill="${palette.lime}">"${xml(profile.role)}"</tspan><tspan fill="${palette.text}">,</tspan></text>
    <text x="54" y="276"><tspan fill="${palette.text}">  education: </tspan><tspan fill="${palette.lime}">"CE + AI @ UF"</tspan><tspan fill="${palette.text}">,</tspan></text>
    <text x="54" y="308"><tspan fill="${palette.text}">  minor: </tspan><tspan fill="${palette.lime}">"${xml(profile.minor)}"</tspan><tspan fill="${palette.text}">,</tspan></text>
    <text x="54" y="340"><tspan fill="${palette.text}">  previous: </tspan><tspan fill="${palette.lime}">"${xml(profile.previous)}"</tspan><tspan fill="${palette.text}">,</tspan></text>
    <text x="54" y="372"><tspan fill="${palette.text}">  focus: [</tspan><tspan fill="${palette.lime}">"AI systems"</tspan><tspan fill="${palette.text}">, </tspan><tspan fill="${palette.lime}">"products"</tspan><tspan fill="${palette.text}">],</tspan></text>
    <text x="54" y="404"><tspan fill="${palette.text}">  mode: </tspan><tspan fill="${palette.lime}">"always shipping"</tspan><tspan fill="${palette.text}">,</tspan></text>
    <text x="54" y="436" fill="${palette.text}">});</text>
    <rect x="90" y="417" width="8" height="21" fill="${palette.lime}" class="caret"/>
  </g>

  <text x="42" y="490" class="mono tiny" fill="${palette.muted}">RESOLVED MODULES / 8</text>
  ${techNodes}

  <!-- Dependency graph -->
  <text x="656" y="72" class="mono tiny" fill="${palette.muted}">DEPENDENCY GRAPH / RESOLVED</text>
  <text x="1172" y="72" text-anchor="end" class="mono tiny" fill="${palette.lime}">0 ERRORS</text>

  <g fill="none" stroke="${palette.border}" stroke-width="1.5">
    <path d="M760 142C800 142 800 196 846 196"/>
    <path d="M1038 142C998 142 998 196 952 196"/>
    <path d="M760 286C800 286 800 232 846 232"/>
    <path d="M1038 286C998 286 998 232 952 232"/>
    <path d="M899 256V334H771V370"/>
    <path d="M899 334H945V370"/>
    <path d="M899 334H1119V370"/>
  </g>
  <g fill="none" stroke="${palette.lime}" stroke-width="1.5" class="flow">
    <path d="M760 142C800 142 800 196 846 196"/>
    <path d="M1038 142C998 142 998 196 952 196"/>
    <path d="M760 286C800 286 800 232 846 232"/>
    <path d="M1038 286C998 286 998 232 952 232"/>
  </g>

  <g transform="translate(660 108)">
    <rect width="100" height="68" rx="3" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="4" height="68" fill="${palette.violet}"/>
    <text x="16" y="28" class="mono node" fill="${palette.text}">@uf/ce-ai</text>
    <text x="16" y="48" class="mono detail" fill="${palette.muted}">CURRENT</text>
  </g>
  <g transform="translate(1038 108)">
    <rect width="124" height="68" rx="3" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="4" height="68" fill="${palette.coral}"/>
    <text x="16" y="28" class="mono node" fill="${palette.text}">@visa/swe</text>
    <text x="16" y="48" class="mono detail" fill="${palette.muted}">PREVIOUS</text>
  </g>
  <g transform="translate(660 252)">
    <rect width="100" height="68" rx="3" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="4" height="68" fill="${palette.cyan}"/>
    <text x="16" y="28" class="mono node" fill="${palette.text}">math</text>
    <text x="16" y="48" class="mono detail" fill="${palette.muted}">SIDE QUEST</text>
  </g>
  <g transform="translate(1038 252)">
    <rect width="124" height="68" rx="3" fill="${palette.panelAlt}" stroke="${palette.border}"/>
    <rect width="4" height="68" fill="${palette.lime}"/>
    <text x="16" y="28" class="mono node" fill="${palette.text}">curiosity</text>
    <text x="16" y="48" class="mono detail" fill="${palette.muted}">REQUIRED</text>
  </g>

  <g transform="translate(846 178)">
    <rect width="106" height="78" rx="3" fill="${palette.lime}"/>
    <text x="53" y="35" text-anchor="middle" class="sans" font-size="17" font-weight="850" fill="${palette.bg}">gael</text>
    <text x="53" y="55" text-anchor="middle" class="mono detail" fill="${palette.bg}">ENGINEER()</text>
  </g>

  <text x="656" y="350" class="mono tiny" fill="${palette.muted}">SELECTED OUTPUTS</text>
  ${projectNodes}

  <g transform="translate(656 478)">
    <rect width="506" height="72" rx="3" fill="${palette.panel}" stroke="${palette.border}"/>
    <text x="18" y="27" class="mono tiny" fill="${palette.cyan}">BUILD NOTE</text>
    <text x="18" y="50" class="sans" font-size="14" fill="${palette.text}">turning ambitious ideas into software people can use.</text>
  </g>

  <!-- Status bar -->
  <rect x="1" y="586" width="1198" height="33" fill="${palette.lime}"/>
  <text x="18" y="607" class="mono" font-size="11" font-weight="700" fill="${palette.bg}">main*</text>
  <text x="94" y="607" class="mono" font-size="11" fill="${palette.bg}">profile@${build}</text>
  <text x="1178" y="607" text-anchor="end" class="mono" font-size="11" fill="${palette.bg}">UTF-8  /  TYPESCRIPT  /  0 ERRORS, SEVERAL IDEAS</text>
</svg>`;

const button = ({ label, color, icon }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="48" viewBox="0 0 220 48" role="img" aria-label="${xml(label)}">
  <style>.sans{font-family:Inter,ui-sans-serif,system-ui,sans-serif}.mono{font-family:Consolas,monospace}</style>
  <rect x="1" y="1" width="218" height="46" rx="4" fill="${palette.panel}" stroke="${palette.border}" stroke-width="2"/>
  <rect x="1" y="1" width="6" height="46" rx="3" fill="${color}"/>
  ${icon === "code"
    ? `<path d="M30 18l-6 6 6 6M38 18l6 6-6 6" fill="none" stroke="${color}" stroke-width="2"/>`
    : `<rect x="23" y="17" width="14" height="14" fill="${color}"/><text x="30" y="28" text-anchor="middle" class="sans" font-size="9" font-weight="900" fill="${palette.bg}">in</text>`}
  <text x="58" y="29" class="sans" font-size="12" font-weight="750" letter-spacing="1.6" fill="${palette.text}">${xml(label)}</text>
  <text x="198" y="29" text-anchor="end" class="mono" font-size="17" fill="${color}">↗</text>
</svg>`;

const outputs = [
  ["images/profile-runtime.svg", graph],
  ["images/projects-button-runtime.svg", button({ label: "VIEW PROJECTS", color: palette.lime, icon: "code" })],
  ["images/linkedin-button-runtime.svg", button({ label: "LINKEDIN", color: palette.violet, icon: "linkedin" })]
];

for (const [relativePath, contents] of outputs) {
  const destination = resolve(root, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${contents}\n`, "utf8");
}

console.log(`profile artifacts generated from build ${build}`);
