import type { BuildConfig } from "bun";

async function runBuild() {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    target: "node",
    sourcemap: "external",
    minify: false,
    plugins: [],
    external: ["playwright-core", "playwright", "@ngrok/ngrok"],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  if (!result.success) {
    console.error("Build failed:", result.logs);
    process.exit(1);
  }

  console.log("Build completed successfully!");
}

runBuild().catch(console.error);
