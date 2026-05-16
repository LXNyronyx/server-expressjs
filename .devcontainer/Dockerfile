# Use the official Node.js LTS image as the base
FROM node:20-bookworm-slim

# Install basic development tools and clean up cache to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /workspace

# Set the default user to 'node' for security best practices
USER node

# Expose the default port for Express applications
EXPOSE 3000
