/** @type {import('@react-router/dev/config').Config} */
export default {
  // Server-side render by default (great for SEO); the client then hydrates.
  ssr: true,
  // Home route ne build-time par static HTML ma prerender karie — etle koi pan
  // static host (ya CDN) par server vagar deploy thai sake, ane SSR jevu j fully
  // rendered HTML male (SEO + LCP same). react-router-serve local par pan chale chhe.
  async prerender() {
    return ['/'];
  },
};
