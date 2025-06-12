# TRANSPO - SEO Implementation Guide

## 🎯 SEO Features Implemented

### 1. **Meta Tags & Open Graph**

- ✅ Comprehensive meta tags for all pages
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card support
- ✅ Dynamic metadata generation
- ✅ Multi-language support (Indonesian focus)

### 2. **Structured Data (Schema.org)**

- ✅ Organization schema
- ✅ Local Business schema
- ✅ Website schema
- ✅ Breadcrumb schema
- ✅ JSON-LD implementation

### 3. **Technical SEO**

- ✅ XML Sitemap generation
- ✅ Robots.txt optimization
- ✅ Canonical URLs
- ✅ PWA manifest
- ✅ Favicon suite (all sizes)

### 4. **Performance & Core Web Vitals**

- ✅ Web Vitals monitoring
- ✅ Performance tracking
- ✅ Analytics integration
- ✅ Long task detection

### 5. **Image Optimization**

- ✅ Open Graph image (1200x630)
- ✅ Twitter Card image
- ✅ Apple Touch Icon
- ✅ Favicon variations
- ✅ Microsoft Tile icons

## 🚀 Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Analytics & SEO
NEXT_PUBLIC_GA_ID="GA_MEASUREMENT_ID"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_FB_PIXEL_ID="PIXEL_ID"
NEXT_PUBLIC_HOTJAR_ID="HOTJAR_ID"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Site Verification
GOOGLE_SITE_VERIFICATION="google-verification-code"
YANDEX_SITE_VERIFICATION="yandex-verification-code"
YAHOO_SITE_VERIFICATION="yahoo-verification-code"
```

### 2. Build & Deploy

```bash
# Install dependencies
pnpm install

# Build with sitemap generation
pnpm build

# Generate sitemap only
pnpm sitemap
```

### 3. Google Search Console Setup

1. Add your domain to Google Search Console
2. Add the verification meta tag to `.env.local`
3. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

## 📊 SEO Components Usage

### Page-level SEO

```tsx
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "Your Page Title",
  description: "Your page description",
  keywords: ["keyword1", "keyword2"],
  url: "/your-page-path",
});
```

### Dynamic SEO Component

```tsx
import SEO from "@/components/SEO";

export default function MyPage() {
  return (
    <>
      <SEO
        title="Custom Page Title"
        description="Custom description"
        keywords={["seo", "optimization"]}
        url="/custom-page"
      />
      {/* Your page content */}
    </>
  );
}
```

### Breadcrumb Schema

```tsx
import BreadcrumbSchema, {
  getBreadcrumbs,
} from "@/components/BreadcrumbSchema";

const breadcrumbs = getBreadcrumbs("/order/angkot");

return (
  <>
    <BreadcrumbSchema items={breadcrumbs} />
    {/* Your page content */}
  </>
);
```

## 🔍 SEO Checklist

### Technical SEO

- [x] XML Sitemap generated
- [x] Robots.txt configured
- [x] Meta tags implemented
- [x] Open Graph tags
- [x] Structured data
- [x] Canonical URLs
- [x] Mobile-friendly
- [x] Page speed optimized

### Content SEO

- [x] Title tags optimized
- [x] Meta descriptions
- [x] Header structure (H1, H2, H3)
- [x] Alt text for images
- [x] Internal linking
- [x] Keyword optimization

### Local SEO (Malang Focus)

- [x] Local business schema
- [x] Geographic keywords
- [x] Location-specific content
- [x] Indonesian language support

## 📈 Analytics & Monitoring

### Google Analytics 4

- Page views tracking
- User engagement
- Conversion tracking
- Custom events

### Core Web Vitals

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)

### Performance Monitoring

- Long task detection
- Page load times
- User experience metrics

## 🎯 Target Keywords

### Primary Keywords

- sewa angkot malang
- sewa hiace malang
- sewa elf malang
- transportasi malang
- rental kendaraan malang

### Long-tail Keywords

- sewa angkot murah di malang
- rental hiace untuk wisata malang
- jasa transportasi pelajar malang
- sewa elf untuk rombongan malang
- booking angkot online malang

## 🔧 Customization

### Adding New Pages

1. Create metadata using `generatePageMetadata()`
2. Add page to sitemap in `src/app/sitemap.ts`
3. Add breadcrumb mapping in `BreadcrumbSchema.tsx`
4. Test Open Graph preview

### Custom Structured Data

```tsx
import StructuredData from "@/components/StructuredData";

<StructuredData
  type="Service"
  data={{
    name: "Angkot Rental Service",
    description: "Professional angkot rental in Malang",
    provider: "TRANSPO",
  }}
/>;
```

## 📋 Testing & Validation

### Tools for Testing

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

### Local Testing

```bash
# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Check manifest
curl http://localhost:3000/manifest.json
```

## 🚀 Next Steps

1. **Content Optimization**

   - Add more location-specific content
   - Create service pages for each vehicle type
   - Add customer testimonials

2. **Technical Improvements**

   - Implement dynamic pricing schema
   - Add review/rating structured data
   - Set up Google My Business integration

3. **Performance**

   - Optimize images further
   - Implement lazy loading
   - Add service worker for caching

4. **Analytics**
   - Set up conversion tracking
   - Implement heat mapping
   - Add A/B testing framework

## 📞 Support

For SEO-related questions or optimizations, refer to:

- Google Search Console documentation
- Next.js SEO best practices
- Schema.org markup validator
