# Static site: no build step needed, just serve the source files directly.
# (Do NOT run this through `vite build` — Vite content-hashes the JS/CSS
# filenames, which breaks the very first load after every redeploy: a
# browser can still hold an index.html referencing the previous deploy's
# hashed filenames, and those files no longer exist once the new
# container replaces the old one, so the request 404s and the page
# renders with no styling at all.)
FROM nginx:alpine AS serve

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY public/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
