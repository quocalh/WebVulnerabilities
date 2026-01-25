FROM node:18-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y \
    postgresql-client \
    util-linux \
    curl \
    netcat \
    procps \
    && rm -rf /var/lib/apt/lists/*
    
RUN npm init -y && npm install express pg body-parser
COPY . .
CMD ["node", "server.js"]