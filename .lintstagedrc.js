const path = require("path");

module.exports = {
  "frontend/src/**/*.{ts,tsx}": (filenames) => {
    const cwd = process.cwd();
    const frontendDir = path.join(cwd, "frontend");
    const relativeToFrontend = filenames.map((f) => {
      const rel = path.relative(frontendDir, f);
      return rel.replace(/\\/g, "/");
    });

    const quotedFrontendFiles = relativeToFrontend.map((f) => `"${f}"`).join(" ");
    const quotedFiles = filenames.map((f) => `"${f}"`).join(" ");

    return [
      `npm --prefix frontend run lint:fix -- ${quotedFrontendFiles}`,
      `npx prettier --write ${quotedFiles}`,
    ];
  },
  "backend/src/**/*.ts": (filenames) => {
    const quotedFiles = filenames.map((f) => `"${f}"`).join(" ");
    return [
      `npx prettier --write ${quotedFiles}`,
    ];
  },
};
