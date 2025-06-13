/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: ["/api/", "/admin/", "/dashboard/admin/"],
      },
    ],
  },
  exclude: ["/api/*", "/admin/*", "/dashboard/admin/*"],
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    // Custom priority for important pages
    const priorityMap = {
      "/": 1.0,
      "/auth/signin": 0.8,
      "/auth/signup": 0.8,
      "/dashboard": 0.9,
      "/order": 0.9,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorityMap[path] || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
