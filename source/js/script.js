import CercForecastApi from "./cerc_forecast_api";
import guidance_blocks from "../../data/health_guidance.json" with { type: "json" };
import Handlebars from "handlebars";
import QRCode from "qrcode";

window.addEventListener("load", () => {
  const zone = "Southwark";

  const api = new CercForecastApi();
  api.getForecasts(zone).then((forecasts) => {
    if (forecasts) {
      const alert_label = forecasts[0].total_status.toLowerCase();
      const context = {
        zone: zone,
        date: "today",
        alert_label: alert_label,
        forecast: forecasts[0],
        guidance_blocks: guidance_blocks.air_pollution[alert_label],
      };
      const settings = getSettings(forecasts);
      renderTemplate(settings.template, context);
    } else {
      renderTemplate("info", {});
    }
    generateQRCode();
  });

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

  function getSettings(forecasts) {
    const forecast_today = forecasts[0];
    const forecast_tomorrow = forecasts[1];
    return { template: "alert", forecast: forecast_today };
    return { template: "info", forecast: forecast_today };

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
});
