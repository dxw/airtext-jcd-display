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
      renderTemplate("info", {});
    }
    generateQRCode();
  });

  function getSettings(forecasts) {
    const forecast_today = forecasts[0];
    const forecast_tomorrow = forecasts[1];

    if (forecast_today.total_status !== "LOW") {
      return { template: "alert", forecast: forecast_today };
    } else if (forecast_tomorrow.total_status !== "LOW") {
      return { template: "alert", forecast: forecast_tomorrow };
    } else if (forecast_today.pollen >= 4 && forecast_today.pollen <= 6) {
      return { template: "pollen", forecast: forecast_today };
    } else if (forecast_today.pollen >= 7) {
      return { template: "pollen", forecast: forecast_today };
    } else {
      return { template: "info", forecast: forecast_today };
    }
  }

  function setContext(context, settings) {
    if (settings.template === "alert") {
      context.airPollutionLabel = settings.forecast.total_status.toLowerCase();
      context.guidanceBlocks = guidanceBlocks.pollen[context.airPollutionLabel];
    }
    if (settings.template === "pollen") {
      context.pollenLabel = pollenLabel(settings.forecast.pollen);
      context.guidanceBlocks = guidanceBlocks.pollen[context.pollenLabel];
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
    if (pollenValue >= 4 && pollenValue <= 6) {
      return "moderate";
    } else if (pollenValue >= 7) {
      return "high";
    } else {
      return "low";
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
    const qr_url = qr_container.getAttribute("data-url");
    QRCode.toCanvas(
      qr_url,
      { errorCorrectionLevel: "H", margin: 0, width: 500, height: 500 },
      function (err, canvas) {
        if (err) throw err;
        qr_container.appendChild(canvas);
      },
    );
  }
});
