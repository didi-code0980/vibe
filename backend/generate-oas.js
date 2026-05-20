const http = require("http");
const fs = require("fs");
const path = require("path");

const url = "http://localhost:8080/v3/api-docs";
const out = path.join(__dirname, "src/main/resources/openapi.yaml");

function toYaml(val, indent) {
  const pad = "  ".repeat(indent);
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return String(val);
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    const needsQuote =
      val === "" ||
      val === "true" ||
      val === "false" ||
      val.startsWith(" ") ||
      val.includes(":") ||
      val.includes("#") ||
      val.includes("'") ||
      val.includes("\n") ||
      /^\d/.test(val);
    return needsQuote ? JSON.stringify(val) : val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return "\n" + val.map((v) => pad + "- " + toYaml(v, indent + 1)).join("\n");
  }
  const keys = Object.keys(val);
  if (keys.length === 0) return "{}";
  return "\n" + keys.map((k) => pad + k + ": " + toYaml(val[k], indent + 1)).join("\n");
}

console.log("Fetching", url);

http.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error("Error: server returned", res.statusCode, "— is the backend running?");
    process.exit(1);
  }
  const chunks = [];
  res.on("data", (d) => chunks.push(d));
  res.on("end", () => {
    const obj = JSON.parse(Buffer.concat(chunks).toString());
    const yaml = Object.keys(obj)
      .map((k) => k + ": " + toYaml(obj[k], 1))
      .join("\n");
    fs.writeFileSync(out, yaml, "utf8");
    console.log("Saved to", out);
  });
}).on("error", () => {
  console.error("Cannot connect to localhost:8080 — start the backend first.");
  process.exit(1);
});
