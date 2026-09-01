// Cloudflare Workers 极速静态资产分发与 SPA 单页路由托管脚本
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      let response = await env.STATIC_ASSETS.fetch(request);
      // SPA 路由回退 (处理刷新防 404)
      if (response.status === 404 && !url.pathname.includes('.')) {
        response = await env.STATIC_ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return response;
    } catch (e) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
