# Use the latest LTS version of Node.js
FROM node:23-alpine

LABEL project="hedgehoglabs-demo"

# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install --prefer-offline
 
# Copy the rest of your application files
COPY . ./
 
# Expose the port your app runs on
EXPOSE 3000
 
# Define the command to run your app
CMD ["npm", "start"]
