import QRCode from 'qrcode';
import Handlebars from 'handlebars';
import guidance_blocks from '../../data/health_guidance.json' with { type: "json" };

window.addEventListener("load", () => {
  // Make a request to the airtext API
  // Populate context with the response

  const source = document.getElementById("alert-template").innerHTML;
  const template = Handlebars.compile(source);
  const context = {
    alert_status: "high",
    forecast: {
      date: 'Today',
      zone: {
        name: 'Southwark',
      },
      air_pollution: {
        total: 8,
      }
    },
    guidance_blocks: guidance_blocks.air_pollution['low']
  }
  const html = template(context);
  document.getElementsByTagName("main")[0].innerHTML = html;


  // Generate a QR code
  const qr_canvas = document.getElementById('qr-code');
  const qr_url = qr_canvas.getAttribute('data-url');
  QRCode.toCanvas(qr_canvas, qr_url, { errorCorrectionLevel: 'H' }, function (err, canvas) {
    if (err) throw err

    console.log('QR code generated')
  })
})