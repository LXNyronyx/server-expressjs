# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install application dependencies
# Using 'npm ci' is preferred for production, but 'npm install' works for general setups
RUN npm install --only=production

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the environment variable for production
ENV NODE_ENV=production

# Command to run the application
CMD [ "node", "server.js" ]
