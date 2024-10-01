# Use the official Bun image as the base
FROM oven/bun:1.1.29

# Set the working directory in the container
WORKDIR /app

# Install dependencies for Puppeteer to work (non-headless chrome)
RUN apt-get update && apt-get install -y \
    wget \
    --no-install-recommends && \
    apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and bun.lockb (if available)
COPY package.json bun.lockb* ./

# Install app dependencies
RUN bun install --verbose

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# List out
RUN ls

# Command to run the application
CMD ["bun", "run", "src/index.ts"]