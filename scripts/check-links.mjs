const baseUrl = process.env.SITE_URL || "http://localhost:3000";
const urls = [
  new URL("/", baseUrl).toString(),
  new URL("/privacy", baseUrl).toString(),
  new URL("/terms", baseUrl).toString(),
  "https://github.com/Drei010/python-rag-learning",
  "https://bite-scout-seven.vercel.app/",
  "https://github.com/Drei010/BiteScout",
  "https://luto-ko.vercel.app/",
  "https://github.com/Drei010/drei010-portfolio",
  "https://linkedin.com/in/andrei-kyle-hidalgo",
];

const failures = [];
for (const url of urls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (!response.ok) failures.push(`${response.status} ${url}`);
    else console.log(`✓ ${response.status} ${url}`);
  } catch (error) {
    if (error?.name === "AbortError") console.warn(`⚠ timeout ${url}`);
    else failures.push(`error ${url}: ${error?.message || error}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failures.length) {
  console.error("\nBroken links:");
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exitCode = 1;
}
