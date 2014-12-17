/**
 * Builds a URL, using a base URL and a map of parameter values.
 * @param {string} url The base URL, which may already include query parameters.
 * @param {Object} params A map of URL parameters.
 * @returns {string} The final URL.
 */
function buildUrl_(url, params) {
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}
