const DEFAULT_TARGET_URL = "https://petshopbe.onrender.com/health";

const getTargetUrl = () => {
  const raw =
    process.env.RENDER_BE_HEALTH_URL ||
    process.env.BE_HEALTH_URL ||
    process.env.BACKEND_HEALTH_URL ||
    DEFAULT_TARGET_URL;
  return String(raw || DEFAULT_TARGET_URL).trim();
};

const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "petshop-vercel-keepalive",
        "x-keepalive": "1",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = async (req, res) => {
  const targetUrl = getTargetUrl();

  try {
    const response = await fetchWithTimeout(targetUrl, 10000);
    const text = await response.text();

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({
      ok: response.ok,
      targetUrl,
      upstreamStatus: response.status,
      timestamp: new Date().toISOString(),
      bodyPreview: text.slice(0, 120),
    });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({
      ok: false,
      targetUrl,
      error: error?.name === "AbortError" ? "TIMEOUT" : (error?.message || "UNKNOWN_ERROR"),
      timestamp: new Date().toISOString(),
    });
  }
};
