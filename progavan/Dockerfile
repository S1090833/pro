FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Copia il file GeoJSON nella cartella dist/geo
RUN mkdir -p dist/geo && cp src/geo/faoAreas.geojson dist/geo/faoAreas.geojson

CMD ["node", "dist/server.js"]
