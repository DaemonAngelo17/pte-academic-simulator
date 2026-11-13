const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public/media/images');
fs.mkdirSync(imagesDir, { recursive: true });

// Create additional SVG charts for Describe Image (DI)
const svgCharts = {
  'di-sleep-chart.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Average Sleep Duration by Age Group (Hours / Night)</text>
  <line x1="70" y1="60" x2="70" y2="290" stroke="#475569" stroke-width="2"/>
  <line x1="70" y1="290" x2="550" y2="290" stroke="#475569" stroke-width="2"/>
  <text x="58" y="75" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">10h</text>
  <text x="58" y="130" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">8h</text>
  <text x="58" y="185" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">6h</text>
  <text x="58" y="240" text-anchor="end" font-family="Arial" font-size="11" fill="#64748b">4h</text>
  <rect x="95" y="95" width="60" height="195" fill="#2563eb" rx="4"/>
  <text x="125" y="88" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#1e40af">8.5 hrs</text>
  <text x="125" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Under 18</text>
  <rect x="185" y="118" width="60" height="172" fill="#3b82f6" rx="4"/>
  <text x="215" y="111" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#1d4ed8">7.5 hrs</text>
  <text x="215" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">18–30</text>
  <rect x="275" y="134" width="60" height="156" fill="#60a5fa" rx="4"/>
  <text x="305" y="127" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#1d4ed8">6.8 hrs</text>
  <text x="305" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">31–45</text>
  <rect x="365" y="141" width="60" height="149" fill="#f59e0b" rx="4"/>
  <text x="395" y="134" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#b45309">6.5 hrs</text>
  <text x="395" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">46–60</text>
  <rect x="455" y="131" width="60" height="159" fill="#10b981" rx="4"/>
  <text x="485" y="124" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#047857">6.9 hrs</text>
  <text x="485" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Over 60</text>
</svg>`,
  'di-library-line.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Monthly University Library Visits (Jan – Jun)</text>
  <line x1="75" y1="60" x2="75" y2="290" stroke="#475569" stroke-width="2"/>
  <line x1="75" y1="290" x2="550" y2="290" stroke="#475569" stroke-width="2"/>
  <polyline fill="none" stroke="#0284c7" stroke-width="4" points="110,255 190,242 270,218 350,190 430,140 510,85"/>
  <circle cx="110" cy="255" r="5" fill="#0369a1"/><text x="110" y="243" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#0f172a">9,000</text><text x="110" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Jan</text>
  <circle cx="190" cy="242" r="5" fill="#0369a1"/><text x="190" y="230" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#0f172a">12,000</text><text x="190" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Feb</text>
  <circle cx="270" cy="218" r="5" fill="#0369a1"/><text x="270" y="206" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#0f172a">18,000</text><text x="270" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Mar</text>
  <circle cx="350" cy="190" r="5" fill="#0369a1"/><text x="350" y="178" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#0f172a">25,000</text><text x="350" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Apr</text>
  <circle cx="430" cy="140" r="5" fill="#0369a1"/><text x="430" y="128" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#0f172a">37,500</text><text x="430" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">May</text>
  <circle cx="510" cy="85" r="6" fill="#dc2626"/><text x="510" y="73" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#b91c1c">50,000</text><text x="510" y="312" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Jun</text>
</svg>`,
  'di-cetacean-bars.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <rect width="600" height="360" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Cetacean Sightings in Coastal Bay (2017–2020): Dolphins vs Whales</text>
  <line x1="70" y1="60" x2="70" y2="290" stroke="#475569" stroke-width="2"/>
  <line x1="70" y1="290" x2="540" y2="290" stroke="#475569" stroke-width="2"/>
  <!-- 2017 -->
  <rect x="100" y="229" width="32" height="61" fill="#0ea5e9"/><text x="116" y="223" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#0284c7">203</text>
  <rect x="136" y="133" width="32" height="157" fill="#1e3a8a"/><text x="152" y="127" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e3a8a">522</text>
  <text x="134" y="312" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">2017</text>
  <!-- 2018 -->
  <rect x="215" y="226" width="32" height="64" fill="#0ea5e9"/><text x="231" y="220" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#0284c7">211</text>
  <rect x="251" y="214" width="32" height="76" fill="#1e3a8a"/><text x="267" y="208" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e3a8a">253</text>
  <text x="249" y="312" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">2018</text>
  <!-- 2019 -->
  <rect x="330" y="167" width="32" height="123" fill="#0ea5e9"/><text x="346" y="161" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#0284c7">409</text>
  <rect x="366" y="216" width="32" height="74" fill="#1e3a8a"/><text x="382" y="210" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e3a8a">247</text>
  <text x="364" y="312" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">2019</text>
  <!-- 2020 -->
  <rect x="445" y="136" width="32" height="154" fill="#0ea5e9"/><text x="461" y="130" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#0284c7">513</text>
  <rect x="481" y="78" width="32" height="212" fill="#1e3a8a"/><text x="497" y="72" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1e3a8a">707</text>
  <text x="479" y="312" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">2020</text>
  <!-- Legend -->
  <rect x="200" y="332" width="12" height="12" fill="#0ea5e9"/><text x="218" y="342" font-family="Arial" font-size="11" fill="#334155">Dolphins</text>
  <rect x="310" y="332" width="12" height="12" fill="#1e3a8a"/><text x="328" y="342" font-family="Arial" font-size="11" fill="#334155">Whales</text>
</svg>`,
  'di-reading-table.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
  <rect width="600" height="340" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Weekly Reading Habits in Winstone (Hours per Week)</text>
  <rect x="40" y="60" width="520" height="40" fill="#003865"/>
  <text x="120" y="85" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Demographic</text>
  <text x="255" y="85" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Books</text>
  <text x="355" y="85" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Social Media</text>
  <text x="450" y="85" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Newspapers</text>
  <text x="525" y="85" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Blogs</text>
  <!-- Row 1 -->
  <rect x="40" y="100" width="520" height="55" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="120" y="132" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#1e293b">Students</text>
  <text x="255" y="132" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">3 hrs</text>
  <text x="355" y="132" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#2563eb">7 hrs (Peak)</text>
  <text x="450" y="132" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">1 hr</text>
  <text x="525" y="132" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">2 hrs</text>
  <!-- Row 2 -->
  <rect x="40" y="155" width="520" height="55" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="120" y="187" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#1e293b">Working Adults</text>
  <text x="255" y="187" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#0f766e">5 hrs</text>
  <text x="355" y="187" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">2 hrs</text>
  <text x="450" y="187" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">2 hrs</text>
  <text x="525" y="187" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">1 hr</text>
  <!-- Row 3 -->
  <rect x="40" y="210" width="520" height="55" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="120" y="242" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#1e293b">Retired Adults</text>
  <text x="255" y="242" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#b45309">8 hrs (Peak)</text>
  <text x="355" y="242" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">1 hr</text>
  <text x="450" y="242" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">2 hrs</text>
  <text x="525" y="242" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">1 hr</text>
</svg>`,
  'di-retention-pies.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="600" height="350" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
  <text x="300" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">University Study Outcomes &amp; Attrition Reasons by Gender</text>
  <circle cx="175" cy="165" r="75" fill="#e2e8f0" stroke="#003865" stroke-width="3"/>
  <text x="175" y="150" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#003865">Male Students</text>
  <text x="175" y="170" text-anchor="middle" font-family="Arial" font-size="11" fill="#047857">60% Completed</text>
  <text x="175" y="188" text-anchor="middle" font-family="Arial" font-size="11" fill="#b45309">25% Employment</text>
  <text x="175" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#dc2626">4% Family / 11% Other</text>
  <circle cx="425" cy="165" r="75" fill="#f1f5f9" stroke="#0284c7" stroke-width="3"/>
  <text x="425" y="150" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#0284c7">Female Students</text>
  <text x="425" y="170" text-anchor="middle" font-family="Arial" font-size="11" fill="#047857">65% Completed</text>
  <text x="425" y="188" text-anchor="middle" font-family="Arial" font-size="11" fill="#b45309">12% Employment</text>
  <text x="425" y="205" text-anchor="middle" font-family="Arial" font-size="11" fill="#dc2626">11% Family / 12% Other</text>
  <text x="300" y="305" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">Key Comparison: Females show higher completion (65% vs 60%); Males leave more for jobs (25% vs 12%).</text>
</svg>`
};

for (const [filename, content] of Object.entries(svgCharts)) {
  fs.writeFileSync(path.join(imagesDir, filename), content, 'utf8');
}
console.log('Generated SVG charts in public/media/images/');

