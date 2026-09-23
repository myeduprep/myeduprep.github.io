# My EDU Prep website

This is the bilingual static website for My EDU Prep, designed for GitHub Pages.

## Pages

- Home
- Long-Term Planning
- Specialist Tutoring
- Academic Summer Camps
- Undergraduate and Postgraduate Application Support
- Testimonials
- About
- Contact
- Insights / Blogs

## Editing content

Each page has its own folder and an `index.html` file. Korean text uses the `lang-ko` class and English text uses `lang-en`. Shared colours and layout are in `site.css`; navigation, footer and the language switch are in `site.js`.

For step-by-step Korean instructions, see `EDITING-GUIDE.md`.

Images are in the `assets` folder. When replacing an image, using the same file name avoids changing the page code.

Service-related Korean articles, future videos and testimonial links are managed in `content-data.js`. The same data powers the service pages and the Insights page.

## Search optimisation

This site does not need a WordPress SEO plugin. It includes page titles, descriptions, canonical URLs, social sharing metadata, `robots.txt`, and `sitemap.xml` directly in the site.

## Publishing on GitHub Pages

For the safest launch, publish to the temporary GitHub Pages address first and connect the live `myeduprep.com` domain only after the site has been reviewed.

1. Create a GitHub repository named `myeduprep.github.io`, then upload or push all files in this folder to it.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then click **Save**.

The site will appear at <https://myeduprep.github.io/> after GitHub finishes publishing it.

To replace the current live website, configure `myeduprep.com` under **Settings → Pages → Custom domain**, then update the domain's DNS records. Do this only after the GitHub Pages preview has been approved.
