# Public Assets

This directory contains static assets and configuration files that are served directly by the web server.

## 📁 Directory Contents

- `_redirects`: Netlify configuration file for handling client-side routing

## 🔄 Netlify Configuration

### _redirects

The `_redirects` file is used by Netlify to configure URL redirects, which is essential for single-page applications with client-side routing. It ensures that all routes are properly handled by the React Router even on page refreshes or direct URL access.

The configuration typically looks like:

```
/*    /index.html   200
```

This rule tells Netlify to serve the `index.html` file (which loads the React application) for any requested path, returning a 200 status code. This allows React Router to handle the routing on the client side.

## 🖼️ Static Assets

This directory is the appropriate place to store:

- Favicon files (favicon.ico, apple-touch-icon.png, etc.)
- Robots.txt file
- Site manifest files (manifest.json, site.webmanifest)
- Static images that need to be referenced directly by URL
- Open Graph images for social media sharing
- Third-party verification files

## 🔍 Asset Management

### When to Use Public Directory vs. Imported Assets

- **Public Directory**: Use for files that need to maintain their exact filenames and paths, or that need to be accessible via direct URL
- **Imported Assets**: For images and other assets used within the application, prefer importing them in the component files so they can be processed by the build system

### Asset Optimization

Files in the public directory:
- Are copied as-is to the build folder
- Don't go through the build pipeline
- Don't benefit from bundling or optimization
- Must be referenced using absolute paths

## 🚀 Deployment Considerations

During the build process, all files in the public directory are copied to the build output directory. When deploying to Netlify:

1. The build process compiles the React application
2. Files from the public directory are copied to the build output
3. Netlify serves the build output, applying the rules in `_redirects`

## 📋 Best Practices

1. Keep this directory organized and minimal
2. Only place files here that truly need to be publicly accessible
3. Document any special files or configurations
4. Consider using asset imports in your React components for better optimization
5. Use subdirectories to organize different types of static assets if the directory grows
