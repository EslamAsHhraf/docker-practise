# Note:

## 1 <a href="https://www.youtube.com/watch?v=og6jyK1U4rw&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=5"> Dockerfile </a>

```
# Base image with latest Node.js 20
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json (and optionally package-lock.json) first
# This helps leverage Docker layer caching for faster builds
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port your app runs on (for Doc)
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"]
```
<img src="./assets//DockerFile.png" width="600px">

## 2 <a href="https://www.youtube.com/watch?v=brdr_88m20k&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=5">Images & Containers</a>
<img src="./assets//Images & Containers.png" width="800px">

## 3 <a href="https://www.youtube.com/watch?v=UDqNwH4VpOU&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=6">Docker Optimization </a> 
- Use a `.dockerignore` file to exclude directories or files that shouldn't be included in the Docker image (e.g., node_modules, logs, etc.).

- Copy only the `package.json` and package-lock.json (if available) before copying the rest of the code. This ensures that npm install is only re-run when dependencies change, not every time the application code is updated.

- 🔍 So... is Docker smart enough to know that it’s npm install?
Nope — not exactly.

Docker itself doesn’t actually understand what npm install is or does. It’s not inspecting the command and going:

"Oh hey! That's npm install, so I’ll only run it if package.json changes."

Instead, Docker just tracks file changes between layers. It doesn't interpret commands — it treats them like black boxes. What it does is this:

🚦 Docker's logic is:
"If the files involved in a COPY or ADD command haven’t changed since last build, then reuse the cached layer — including any commands (RUN, etc.) that came after."
