import { CERC_FORECAST_API_KEY } from '../../api-key';

export default class CercForecastApi {
  getForecasts(zone) {
    const query = {
      numdays: 2,
      zone: zone,
      key: CERC_FORECAST_API_KEY
    }

    const url = new URL('https://london-airtext-forecasts-api-gateway-7x54d7qf.nw.gateway.dev/getforecast/all');
    url.search = new URLSearchParams(query).toString();

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        return data.zones.find(z => z.zone_name === zone).forecasts;
      })
      .catch(error => {
        return;
      });
  }
}