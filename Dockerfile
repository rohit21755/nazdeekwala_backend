# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

COPY /config/config.env /config/config.env

# Build the React app
#RUN npm run build

# Expose the port that the app will run on
EXPOSE 8000

# Command to run the app
CMD ["npm", "start"]
