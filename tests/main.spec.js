import { test, expect } from "@playwright/test";
import defaultApiResponse from "./fixtures/api-response.json";
import defaultsDeep from "lodash.defaultsdeep";

async function stubApiResponse(page, apiResponse) {
  defaultsDeep(apiResponse, defaultApiResponse);
  await page.route(
    "https://london-airtext-forecasts-api-gateway-7x54d7qf.nw.gateway.dev/getforecast/all*",
    (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiResponse),
      });
    },
  );
}

test.describe("index page", () => {
  test.describe("when there is an air pollution alert today", () => {
    test("should render the air pollution alert today template", async ({
      page,
    }) => {
      const apiResponse = defaultApiResponse;
      apiResponse.zones[0].forecasts[0].total_status = "HIGH";
      apiResponse.zones[0].forecasts[0].total = 8;
      await stubApiResponse(page, apiResponse);

      await page.goto("/");
      await page.waitForSelector("#hero-block");
      await expect(page.getByText("Air pollution is high today")).toBeVisible();
    });
  });

  test.describe("when there is an air pollution alert tomorrow", () => {
    test("should render the air pollution alert tomorrow template", async ({
      page,
    }) => {
      const apiResponse = defaultApiResponse;
      apiResponse.zones[0].forecasts[1].total_status = "HIGH";
      apiResponse.zones[0].forecasts[1].total = 8;
      await stubApiResponse(page, apiResponse);

      await page.goto("/");
      await page.waitForSelector("#hero-block");
      await expect(page.getByText("will be high tomorrow")).toBeVisible();
    });
  });

  test.describe("when there is a pollen alert", () => {
    test("should render the pollen template", async ({ page }) => {
      const apiResponse = defaultApiResponse;
      apiResponse.zones[0].forecasts[0].pollen = 10;
      await stubApiResponse(page, apiResponse);

      await page.goto("/");
      await page.waitForSelector("#hero-block");
      await expect(
        page.getByText("Pollen levels are very high today"),
      ).toBeVisible();
    });
  });

  test.describe("when there is no alert", () => {
    test("should render one of the info templates", async ({ page }) => {
      const apiResponse = defaultApiResponse;
      apiResponse.zones[0].forecasts[0].total_status = "LOW";
      await stubApiResponse(page, apiResponse);

      await page.goto("/");
      await page.waitForSelector("#hero-block");
      await expect(
        page
          .getByText("Sign up now to free air quality alerts")
          .or(page.getByText("The air you breathe matters"))
          .or(page.getByText("Busy roads mean higher air pollution")),
      ).toBeVisible();
    });
  });

  // When the API returns an error
  test.describe("when the API returns an error", () => {
    test("should render the subscription-actionable template", async ({
      page,
    }) => {
      await page.route(
        "https://london-airtext-forecasts-api-gateway-7x54d7qf.nw.gateway.dev/getforecast/all*",
        (route) => {
          route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: "Internal Server Error" }),
          });
        },
      );

      await page.goto("/");
      await page.waitForSelector("#hero-block");
      await expect(
        page.getByText("Sign up now to free air quality alerts"),
      ).toBeVisible();
    });
  });
});
