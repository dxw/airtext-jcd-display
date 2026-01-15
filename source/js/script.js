import config from "../../config/config.json" with { type: "json" };
import CercForecastApi from "./cerc_forecast_api";
import guidanceBlocks from "../../data/health_guidance.json" with { type: "json" };
import Handlebars from "handlebars";
import QRCode from "qrcode";
import dummyApiResponse from "../../tests/fixtures/api-response.json" with { type: "json" };

window.addEventListener("load", () => {
  const api = new CercForecastApi();
  const zone = config.ZONE;

  const urlParams = new URLSearchParams(window.location.search);

  // Rotate the display if set
  if (config.SCREEN_ORIENTATION === "portrait") {
    document.documentElement.style.setProperty("--rotation", "-90deg");
    document.documentElement.style.setProperty("--translate-x", "-100vh");
    document.documentElement.style.setProperty("--full-width", "100vh");
    document.documentElement.style.setProperty("--full-height", "100vw");
    document.documentElement.style.setProperty("--unit", "1vw");
  } else {
    document.documentElement.style.setProperty("--rotation", "0deg");
    document.documentElement.style.setProperty("--translate-x", "0");
    document.documentElement.style.setProperty("--full-width", "100vw");
    document.documentElement.style.setProperty("--full-height", "100vh");
    document.documentElement.style.setProperty("--unit", "1vh");
  }

  // If the dummy query parameter is present, use the dummy data
  const dummyScenario = urlParams.get("dummy");
  const infoTemplate = urlParams.get("info");

  const dummyScenarios = {
    normal: (forecasts) => forecasts,
    veryHighPollutionToday: (forecasts) => {
      forecasts[0].total_status = "VERY HIGH";
      forecasts[0].total = 10;
      return forecasts;
    },
    highPollutionToday: (forecasts) => {
      forecasts[0].total_status = "HIGH";
      forecasts[0].total = 8;
      return forecasts;
    },
    moderatePollutionToday: (forecasts) => {
      forecasts[0].total_status = "MODERATE";
      forecasts[0].total = 6;
      return forecasts;
    },
    veryHighPollenToday: (forecasts) => {
      forecasts[0].pollen = 10;
      return forecasts;
    },
    highPollenToday: (forecasts) => {
      forecasts[0].pollen = 8;
      return forecasts;
    },
    moderatePollenToday: (forecasts) => {
      forecasts[0].pollen = 5;
      return forecasts;
    },
    highPollutionTomorrow: (forecasts) => {
      forecasts[1].total_status = "HIGH";
      forecasts[1].total = 8;
      return forecasts;
    },
    moderatePollutionTomorrow: (forecasts) => {
      forecasts[1].total_status = "MODERATE";
      forecasts[1].total = 6;
      return forecasts;
    },
  };

  if (dummyScenario) {
    const dummyForecasts = dummyScenarios[dummyScenario](
      dummyApiResponse.zones[0].forecasts,
    );
    renderDisplay(dummyForecasts, infoTemplate);
  } else {
    api.getForecasts(zone).then((forecasts) => {
      renderDisplay(forecasts, infoTemplate);
    });
  }

  function renderDisplay(forecasts, infoTemplate = "random") {
    if (forecasts) {
      const template = getTemplate(forecasts, infoTemplate);
      const context = setContext(
        {
          zone: zone,
          forecastToday: forecasts[0],
          forecastTomorrow: forecasts[1],
        },
        template,
      );

      renderTemplate(template, context);
    } else {
      renderTemplate("subscription-actionable");
    }
    generateQRCode();
  }

  function getTemplate(forecasts, infoTemplate) {
    const forecast_today = forecasts[0];
    const forecast_tomorrow = forecasts[1];

    if (forecast_today.total_status !== "LOW") {
      return "air-pollution-alert";
    } else if (forecast_tomorrow.total_status !== "LOW") {
      return "air-pollution-alert-tomorrow";
    } else if (forecast_today.pollen >= 4) {
      return "pollen-alert";
    } else {
      if (infoTemplate && infoTemplate != "random") {
        return infoTemplate;
      }

      // Randomly choose between subscription-actionable, subscription-reflexive, and educational
      const random = Math.floor(Math.random() * 3);
      switch (random) {
        case 0:
          return "subscription-actionable";
        case 1:
          return "subscription-reflexive";
        case 2:
          return "educational";
      }
    }
  }

  function setContext(context, template) {
    if (template === "air-pollution-alert") {
      context.airPollutionLabel =
        context.forecastToday.total_status.toLowerCase();
      context.airPollutionLabelClass = context.airPollutionLabel.replace(
        " ",
        "_",
      );
      context.guidanceBlocks =
        guidanceBlocks.air_pollution[context.airPollutionLabelClass];
    }
    if (template === "air-pollution-alert-tomorrow") {
      context.airPollutionLabelToday =
        context.forecastToday.total_status.toLowerCase();
      context.airPollutionLabelTomorrow =
        context.forecastTomorrow.total_status.toLowerCase();
      context.airPollutionLabelTodayClass =
        context.airPollutionLabelToday.replace(" ", "_");
      context.airPollutionLabelTomorrowClass =
        context.airPollutionLabelTomorrow.replace(" ", "_");
    }
    if (template === "pollen-alert") {
      context.pollenLabel = pollenLabel(context.forecastToday.pollen);
      context.pollenLabelClass = context.pollenLabel.replace(" ", "_");
      context.guidanceBlocks = guidanceBlocks.pollen[context.pollenLabelClass];
    }
    return context;
  }

  function day(selectedForecast, allForecasts) {
    if (selectedForecast === allForecasts[1]) {
      return "tomorrow";
    } else {
      return "today";
    }
  }

  function pollenLabel(pollenValue) {
    if (pollenValue <= 3) {
      return "low";
    } else if (pollenValue <= 6) {
      return "moderate";
    } else if (pollenValue <= 9) {
      return "high";
    } else {
      return "very high";
    }
  }

  function renderTemplate(templateName, context = {}) {
    const source = document.getElementById(
      `${templateName}-template`,
    ).innerHTML;
    const template = Handlebars.compile(source);
    const html = template(context);
    document.getElementsByTagName("main")[0].innerHTML = html;
  }

  function generateQRCode() {
    const qr_container = document.getElementById("qr-code-block");
    const qr_url = "https://" + document.getElementById("cta-url").textContent;
    const color_mode =
      document.getElementById("qr-code-block").dataset.colorMode || "light";
    QRCode.toCanvas(
      qr_url,
      {
        errorCorrectionLevel: "H",
        margin: 0,
        width: 500,
        height: 500,
        color: {
          dark: color_mode === "light" ? "#000000" : "#ffffff",
          light: color_mode === "light" ? "#ffffff" : "#123257",
        },
      },
      function (err, canvas) {
        if (err) throw err;
        qr_container.appendChild(canvas);
      },
    );
  }
});
