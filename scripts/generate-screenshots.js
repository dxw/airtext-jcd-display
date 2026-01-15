#!/usr/bin/env node

/**
 * Generate screenshots for all scenarios
 * This script uses Playwright to capture screenshots of the app in different scenarios
 */

import { chromium } from "@playwright/test";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://127.0.0.1:8080";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");

// Define all scenarios based on the README
const scenarios = [
  // Pollution scenarios
  { name: "veryHighPollutionToday", url: "?dummy=veryHighPollutionToday" },
  { name: "highPollutionToday", url: "?dummy=highPollutionToday" },
  { name: "moderatePollutionToday", url: "?dummy=moderatePollutionToday" },
  { name: "highPollutionTomorrow", url: "?dummy=highPollutionTomorrow" },
  {
    name: "moderatePollutionTomorrow",
    url: "?dummy=moderatePollutionTomorrow",
  },

  // Pollen scenarios
  { name: "veryHighPollenToday", url: "?dummy=veryHighPollenToday" },
  { name: "highPollenToday", url: "?dummy=highPollenToday" },
  { name: "moderatePollenToday", url: "?dummy=moderatePollenToday" },

  // Info templates (with normal dummy data)
  {
    name: "subscription-actionable",
    url: "?dummy=normal&info=subscription-actionable",
  },
  {
    name: "subscription-reflexive",
    url: "?dummy=normal&info=subscription-reflexive",
  },
  { name: "educational", url: "?dummy=normal&info=educational" },
];

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log("Starting http-server...\n");
    const server = spawn("npx", ["-y", "http-server", "-p", "8080", "-s"], {
      cwd: path.join(__dirname, ".."),
    });

    server.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Hit CTRL-C to stop")) {
        console.log("Server ready!\n");
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      // http-server outputs to stderr, so we check for ready message here too
      const output = data.toString();
      if (output.includes("Hit CTRL-C to stop")) {
        console.log("Server ready!\n");
        resolve(server);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolve(server); // Resolve anyway after timeout
    }, 10000);
  });
}

async function generateScreenshots() {
  console.log("Starting screenshot generation...\n");

  // Start the server
  const server = await startServer();

  try {
    // Launch browser
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: {
        width: 1080,
        height: 1920,
      },
    });

    const page = await context.newPage();

    // Generate screenshots for each scenario
    for (const scenario of scenarios) {
      try {
        console.log(`Capturing: ${scenario.name}`);

        // Navigate to the scenario URL
        await page.goto(`${BASE_URL}/${scenario.url}`, {
          waitUntil: "networkidle",
        });

        // Wait for the hero block to ensure content is loaded
        await page.waitForSelector("#hero-block", { timeout: 10000 });

        // Take screenshot
        const screenshotPath = path.join(
          SCREENSHOTS_DIR,
          `${scenario.name}.png`,
        );
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        console.log(`  ✓ Saved to ${scenario.name}.png`);
      } catch (error) {
        console.error(`  ✗ Failed to capture ${scenario.name}:`, error.message);
      }
    }

    // Close browser
    await browser.close();

    console.log("\n✓ Screenshot generation complete!");
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
  } finally {
    // Stop the server
    if (server) {
      console.log("Stopping server...");
      server.kill();
    }
  }
}

// Run the script
generateScreenshots().catch((error) => {
  console.error("Error generating screenshots:", error);
  process.exit(1);
});
