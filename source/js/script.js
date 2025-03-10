import CercForecastApi from "./cerc_forecast_api";
import guidanceBlocks from "../../data/health_guidance.json" with { type: "json" };
import Handlebars from "handlebars";
import QRCode from "qrcode";

window.addEventListener("load", () => {
  const api = new CercForecastApi();
  const zone = "Southwark";

  api.getForecasts(zone).then((forecasts) => {
    if (forecasts) {
      const settings = getSettings(forecasts);
      const context = setContext(
        {
          zone: zone,
          date: day(settings.forecast, forecasts),
          forecast: settings.forecast,
        },
        settings,
      );

      renderTemplate(settings.template, context);
    } else {
      renderTemplate("subscription-actionable", {});
    }
    generateQRCode();
  });

  function getSettings(forecasts) {
    const forecast_today = forecasts[0];
    const forecast_tomorrow = forecasts[1];

    if (forecast_today.total_status !== "LOW") {
      return { template: "air-pollution-alert", forecast: forecast_today };
    } else if (forecast_tomorrow.total_status !== "LOW") {
      return { template: "air-pollution-alert", forecast: forecast_tomorrow };
    } else if (forecast_today.pollen >= 4 && forecast_today.pollen <= 6) {
      return { template: "pollen-alert", forecast: forecast_today };
    } else if (forecast_today.pollen >= 7) {
      return { template: "pollen-alert", forecast: forecast_today };
    } else {
      return { template: "subscription-actionable", forecast: forecast_today };
    }
  }

  function setContext(context, settings) {
    if (settings.template === "air-pollution-alert") {
      context.airPollutionLabel = settings.forecast.total_status.toLowerCase();
      context.airPollutionLabelClass = context.airPollutionLabel.replace(
        " ",
        "_",
      );
      context.guidanceBlocks =
        guidanceBlocks.air_pollution[context.airPollutionLabelClass];
    }
    if (settings.template === "pollen-alert") {
      context.pollenLabel = pollenLabel(settings.forecast.pollen);
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

  function renderTemplate(templateName, context) {
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
