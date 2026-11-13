const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public/media/images');
fs.mkdirSync(imagesDir, { recursive: true });

// Create additional SVG charts for Describe Image (DI)
const svgCharts = {
  'di-solar-energy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Cumulative Global Solar Photovoltaic Capacity (GW, 2018–2024)</text>
  <line x1="70" y1="60" x2="70" y2="290" stroke="#475569" stroke-width="2"/>
  <line x1="70" y1="290" x2="550" y2="290" stroke="#475569" stroke-width="2"/>
  <text x="58" y="70" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">1600 GW</text>
  <text x="58" y="125" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">1200 GW</text>
  <text x="58" y="180" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">800 GW</text>
  <text x="58" y="235" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">400 GW</text>
  <!-- Bars -->
  <rect x="90" y="220" width="48" height="70" fill="#f59e0b" rx="4"/>
  <text x="114" y="212" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#b45309">505</text>
  <text x="114" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2018</text>

  <rect x="155" y="202" width="48" height="88" fill="#f59e0b" rx="4"/>
  <text x="179" y="194" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#b45309">635</text>
  <text x="179" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2019</text>

  <rect x="220" y="180" width="48" height="110" fill="#f59e0b" rx="4"/>
  <text x="244" y="172" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#b45309">770</text>
  <text x="244" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2020</text>

  <rect x="285" y="155" width="48" height="135" fill="#f59e0b" rx="4"/>
  <text x="309" y="147" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#b45309">940</text>
  <text x="309" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2021</text>

  <rect x="350" y="122" width="48" height="168" fill="#ea580c" rx="4"/>
  <text x="374" y="114" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#c2410c">1,180</text>
  <text x="374" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2022</text>

  <rect x="415" y="85" width="48" height="205" fill="#ea580c" rx="4"/>
  <text x="439" y="77" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#c2410c">1,420</text>
  <text x="439" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2023</text>

  <rect x="480" y="55" width="48" height="235" fill="#dc2626" rx="4"/>
  <text x="504" y="47" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#b91c1c">1,610</text>
  <text x="504" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">2024</text>
</svg>`,

  'di-ocean-zones.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Ocean Vertical Strata &amp; Light Penetration (Depth in Meters)</text>
  <!-- Zones -->
  <rect x="80" y="55" width="440" height="45" fill="#38bdf8" opacity="0.8"/>
  <text x="300" y="82" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#0369a1">Epipelagic (Sunlight Zone): 0 – 200 m (90% Marine Life)</text>

  <rect x="80" y="105" width="440" height="55" fill="#0284c7" opacity="0.85"/>
  <text x="300" y="137" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#ffffff">Mesopelagic (Twilight Zone): 200 – 1,000 m (Bioluminescence)</text>

  <rect x="80" y="165" width="440" height="65" fill="#0369a1" opacity="0.9"/>
  <text x="300" y="202" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#ffffff">Bathypelagic (Midnight Zone): 1,000 – 4,000 m (Total Darkness)</text>

  <rect x="80" y="235" width="440" height="50" fill="#0f172a"/>
  <text x="300" y="265" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#e2e8f0">Abyssopelagic &amp; Hadal Zone: 4,000 – 11,000 m (Freezing, High Pressure)</text>

  <text x="300" y="322" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">Key Observation: Light and biodiversity rapidly decrease as depth and hydrostatic pressure increase.</text>
</svg>`,

  'di-smartphone-os.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Worldwide Mobile OS Market Share Progression (%)</text>
  <line x1="70" y1="60" x2="70" y2="290" stroke="#475569" stroke-width="2"/>
  <line x1="70" y1="290" x2="550" y2="290" stroke="#475569" stroke-width="2"/>
  <!-- Android Line -->
  <polyline fill="none" stroke="#16a34a" stroke-width="4" points="100,140 180,120 260,110 340,105 420,100 500,95"/>
  <!-- iOS Line -->
  <polyline fill="none" stroke="#2563eb" stroke-width="4" points="100,220 180,230 260,235 340,240 420,245 500,248"/>
  <circle cx="500" cy="95" r="5" fill="#15803d"/><text x="515" y="98" font-family="Arial" font-size="12" font-weight="bold" fill="#15803d">Android: 71%</text>
  <circle cx="500" cy="248" r="5" fill="#1d4ed8"/><text x="515" y="252" font-family="Arial" font-size="12" font-weight="bold" fill="#1d4ed8">iOS: 28%</text>
  <text x="100" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2016</text>
  <text x="180" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2018</text>
  <text x="260" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2020</text>
  <text x="340" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2022</text>
  <text x="420" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2024</text>
  <text x="500" y="312" text-anchor="middle" font-family="Arial" font-size="11" fill="#334155">2026</text>
  <!-- Legend -->
  <rect x="210" y="332" width="12" height="12" fill="#16a34a"/><text x="228" y="342" font-family="Arial" font-size="11" fill="#334155">Android</text>
  <rect x="310" y="332" width="12" height="12" fill="#2563eb"/><text x="328" y="342" font-family="Arial" font-size="11" fill="#334155">iOS</text>
</svg>`,

  'di-co2-sectors.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="600" height="350" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Global Greenhouse Gas Emissions by Economic Sector</text>
  <circle cx="200" cy="180" r="95" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Sector Slices visualized with colored segments/indicators -->
  <path d="M200,180 L200,85 A95,95 0 0,1 295,180 Z" fill="#ef4444"/>
  <text x="255" y="140" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">25%</text>

  <path d="M200,180 L295,180 A95,95 0 0,1 240,266 Z" fill="#f59e0b"/>
  <text x="240" y="225" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">24%</text>

  <path d="M200,180 L240,266 A95,95 0 0,1 125,238 Z" fill="#10b981"/>
  <text x="175" y="245" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">21%</text>

  <path d="M200,180 L125,238 A95,95 0 0,1 108,150 Z" fill="#3b82f6"/>
  <text x="125" y="190" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">14%</text>

  <path d="M200,180 L108,150 A95,95 0 0,1 200,85 Z" fill="#8b5cf6"/>
  <text x="145" y="125" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">16%</text>

  <!-- Legend -->
  <g transform="translate(340, 80)">
    <rect x="0" y="0" width="14" height="14" fill="#ef4444" rx="2"/><text x="22" y="12" font-family="Arial" font-size="12" fill="#1e293b">Electricity &amp; Heat (25%)</text>
    <rect x="0" y="32" width="14" height="14" fill="#f59e0b" rx="2"/><text x="22" y="44" font-family="Arial" font-size="12" fill="#1e293b">Agriculture &amp; Land (24%)</text>
    <rect x="0" y="64" width="14" height="14" fill="#10b981" rx="2"/><text x="22" y="76" font-family="Arial" font-size="12" fill="#1e293b">Industry &amp; Refining (21%)</text>
    <rect x="0" y="96" width="14" height="14" fill="#3b82f6" rx="2"/><text x="22" y="108" font-family="Arial" font-size="12" fill="#1e293b">Transportation (14%)</text>
    <rect x="0" y="128" width="14" height="14" fill="#8b5cf6" rx="2"/><text x="22" y="140" font-family="Arial" font-size="12" fill="#1e293b">Buildings &amp; Others (16%)</text>
  </g>
  <text x="300" y="320" text-anchor="middle" font-family="Arial" font-size="12" fill="#64748b">Conclusion: Electricity and Agriculture account for nearly half of all global emissions.</text>
</svg>`,

  'di-water-cycle.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="600" height="350" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Stages of the Terrestrial Hydrological (Water) Cycle</text>
  <!-- Solar Sun -->
  <circle cx="100" cy="90" r="30" fill="#f59e0b"/><text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#ffffff">Solar Heat</text>
  <!-- Clouds -->
  <ellipse cx="280" cy="85" rx="55" ry="25" fill="#94a3b8"/><text x="280" y="90" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff">Condensation</text>
  <!-- Precipitation -->
  <line x1="430" y1="110" x2="415" y2="170" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="460" y1="110" x2="445" y2="170" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="470" y="145" font-family="Arial" font-size="11" font-weight="bold" fill="#0284c7">Precipitation</text>
  <!-- Mountain -->
  <polygon points="340,290 440,160 540,290" fill="#64748b"/>
  <!-- Ocean/Lake -->
  <rect x="50" y="260" width="260" height="50" fill="#38bdf8" rx="4"/>
  <text x="180" y="290" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#0369a1">Ocean Evaporation</text>
  <!-- Evaporation arrows -->
  <line x1="180" y1="250" x2="220" y2="130" stroke="#ea580c" stroke-width="3" marker-end="url(#arrow)"/>
  <text x="215" y="190" font-family="Arial" font-size="11" font-weight="bold" fill="#ea580c">Evaporation</text>
  <!-- Surface runoff -->
  <path d="M430,220 Q350,250 290,270" fill="none" stroke="#0284c7" stroke-width="3"/>
  <text x="350" y="275" font-family="Arial" font-size="11" font-weight="bold" fill="#0284c7">Surface Runoff</text>
  <text x="300" y="332" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">Continuous continuous cycle: Evaporation &rarr; Condensation &rarr; Precipitation &rarr; Runoff.</text>
</svg>`,

  'di-urban-transport.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="600" height="350" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Daily Commuter Transport Modal Split Across 5 Major Cities (%)</text>
  <line x1="80" y1="60" x2="80" y2="280" stroke="#475569" stroke-width="2"/>
  <line x1="80" y1="280" x2="550" y2="280" stroke="#475569" stroke-width="2"/>
  <!-- City 1: Tokyo -->
  <rect x="100" y="110" width="22" height="170" fill="#2563eb"/><text x="111" y="103" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e40af">51%</text>
  <rect x="124" y="240" width="22" height="40" fill="#dc2626"/><text x="135" y="233" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#b91c1c">12%</text>
  <rect x="148" y="220" width="22" height="60" fill="#16a34a"/><text x="159" y="213" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#15803d">18%</text>
  <text x="135" y="300" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#1e293b">Tokyo</text>

  <!-- City 2: London -->
  <rect x="190" y="157" width="22" height="123" fill="#2563eb"/><text x="201" y="150" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e40af">37%</text>
  <rect x="214" y="174" width="22" height="106" fill="#dc2626"/><text x="225" y="167" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#b91c1c">32%</text>
  <rect x="238" y="260" width="22" height="20" fill="#16a34a"/><text x="249" y="253" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#15803d">6%</text>
  <text x="225" y="300" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#1e293b">London</text>

  <!-- City 3: Amsterdam -->
  <rect x="280" y="200" width="22" height="80" fill="#2563eb"/><text x="291" y="193" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e40af">24%</text>
  <rect x="304" y="217" width="22" height="63" fill="#dc2626"/><text x="315" y="210" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#b91c1c">19%</text>
  <rect x="328" y="130" width="22" height="150" fill="#16a34a"/><text x="339" y="123" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#15803d">45%</text>
  <text x="315" y="300" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#1e293b">Amsterdam</text>

  <!-- City 4: New York -->
  <rect x="370" y="180" width="22" height="100" fill="#2563eb"/><text x="381" y="173" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e40af">30%</text>
  <rect x="394" y="163" width="22" height="117" fill="#dc2626"/><text x="405" y="156" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#b91c1c">35%</text>
  <rect x="418" y="270" width="22" height="10" fill="#16a34a"/><text x="429" y="263" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#15803d">3%</text>
  <text x="405" y="300" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#1e293b">New York</text>

  <!-- City 5: Sydney -->
  <rect x="460" y="207" width="22" height="73" fill="#2563eb"/><text x="471" y="200" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e40af">22%</text>
  <rect x="484" y="120" width="22" height="160" fill="#dc2626"/><text x="495" y="113" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#b91c1c">48%</text>
  <rect x="508" y="270" width="22" height="10" fill="#16a34a"/><text x="519" y="263" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#15803d">3%</text>
  <text x="495" y="300" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#1e293b">Sydney</text>

  <!-- Legend -->
  <rect x="180" y="325" width="12" height="12" fill="#2563eb"/><text x="198" y="335" font-family="Arial" font-size="11" fill="#334155">Public Transit</text>
  <rect x="290" y="325" width="12" height="12" fill="#dc2626"/><text x="308" y="335" font-family="Arial" font-size="11" fill="#334155">Private Car</text>
  <rect x="390" y="325" width="12" height="12" fill="#16a34a"/><text x="408" y="335" font-family="Arial" font-size="11" fill="#334155">Cycling &amp; Walking</text>
</svg>`
};

for (const [filename, content] of Object.entries(svgCharts)) {
  fs.writeFileSync(path.join(imagesDir, filename), content, 'utf8');
}
console.log('Generated additional SVGs in public/media/images/');

