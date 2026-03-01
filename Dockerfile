FROM node:20-alpine

WORKDIR /app

# Copy built app
COPY .next ./.next
COPY public ./public
COPY package*.json ./
COPY server.js ./

# Install production dependencies only
RUN npm ci --omit=dev

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]
