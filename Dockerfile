# Simpele, statische website — geen build-stap nodig.
# nginx:alpine is klein (~8 MB) en direct geschikt om HTML/CSS/JS te serveren.
FROM nginx:1.27-alpine

# Eigen nginx-configuratie (gzip + cache-headers voor betere Lighthouse/SEO-score)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Website-bestanden naar de nginx-webroot
COPY index.html /usr/share/nginx/html/index.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY img/ /usr/share/nginx/html/img/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost/ >/dev/null || exit 1
