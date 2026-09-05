# Kleine Node-server die de website (public/), het admin-paneel (admin/) en
# een eenvoudige config-API serveert. Geen aparte database nodig — de inhoud
# staat in data/config.json.
FROM node:20-alpine

WORKDIR /app

# Dependencies eerst installeren (cachet beter tussen builds)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server
COPY public ./public
COPY admin ./admin

# De originele/standaard inhoud gaat mee als "data-default": de server
# kopieert dit bij de allereerste start naar /app/data (zie server/index.js).
# /app/data zelf hoort op een volume te staan, zodat aanpassingen via het
# admin-paneel niet verloren gaan bij een nieuwe image-versie.
COPY data ./data-default

ENV PORT=80
EXPOSE 80
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost/ >/dev/null || exit 1

CMD ["node", "server/index.js"]
