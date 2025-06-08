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

- `docker exec -it node-app-container bash` -> Hey Docker, I want to go inside the running container called node-app-container and use the terminal (just like I do on my local computer).

## 4 <a href="https://www.youtube.com/watch?v=iT5OjRX9UkM&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=7">Docker Hot Reload</a>

* `docker logs node-app-container` This command lets you **see the logs** of a running container — great for checking if your app is working or debugging issues.

* `docker run --name node-app-container -v "relative-path-on-machine:/app" -d -p 4000:4000 node-app` This runs a container and **binds a volume** between your machine and the container. It allows for **live syncing of files**:
   * If you change a file on your machine → it reflects inside the container.
   * If you change a file inside the container → it reflects back on your machine.

## Volume Binding Details

🔄 This sync **overwrites** what you built into the image, even if you added files to `.dockerignore`. So the entire folder on your machine replaces the contents at `/app` inside the container.

## Common Nodemon Issues

### 🧠 Why nodemon might not restart on code changes

If you're on **Windows**, especially using drives like `D:\`, you might notice:
You change a file locally, but **nodemon doesn't detect it** and doesn't restart the server.

This happens because:
* Docker Desktop on Windows runs Linux containers inside a **virtual machine**.
* Your project folder (on Windows NTFS) is shared with the Linux VM through a mounted volume.
* **File system events** (like file changes) sometimes **don't trigger properly** across this bridge.

So while `nodemon` is watching the files, it's not seeing the changes because the **file change events get lost** in translation.

### ✅ How to fix it

Create a `nodemon.json` file in the root of your project with this content:

```json
{ 
  "watch": ["."], 
  "ext": "js,json", 
  "legacyWatch": true, 
  "delay": "200" 
}
```

This tells `nodemon` to **use polling** instead of relying on OS-level file events. It's a bit less efficient, but it works reliably across Docker + Windows setups.

## 5 <a href="https://www.youtube.com/watch?v=voTvVHAi4fM&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=8">Docker Volumes</a>
* `docker run --name node-app-container -v "relative-path-on-machine:/app" -d -p 4000:4000 node-app`
This uses a bind mount, which means your local folder is mounted directly into the container at /app. Changes in either place reflect on the other.

* `docker run --name node-app-container -v "relative-path-on-machine:/app:ro" -d -p 4000:4000 node-app`
This is a read-only bind mount. The container can read the files but cannot write or delete anything inside /app. So your local files stay safe from container changes.

* `docker run --name node-app-container -v "${PWD}:/app:ro" -v /app/node_modules -d -p 4000:4000 node-app`
Here, `${PWD}:/app:ro` mounts your whole project folder read-only, and `/app/node_modules` is an anonymous volume created inside the container to hold dependencies separately.
This means changes you make to `node_modules` on your machine won’t affect the container’s `node_modules`. But since you sync the whole project folder, this setup might not solve all syncing problems.

* A better approach is to only sync the source code folder, not the whole project, for example:


    `docker run --name node-app-container -v "${PWD}/src:/app/src:ro" -d -p 4000:4000 node-app`
    This way, you only sync the important code files inside /src, keeping other parts like node_modules separate and managed by the container.

## 6 <a href="https://www.youtube.com/watch?v=k1Yg4UsrHqs&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=9">Docker Compose</a>

```
version: "3"                 # Specifies the version of the Docker Compose file format. Version 3 is widely used and supports most features.

services:                   # Defines the services (containers) that make up your application.
  node-app:                 # The name of the service; you can refer to it when running Docker Compose commands.
    container_name: node-app-container  # Explicitly sets the container’s name instead of letting Docker generate a random one.
    build: .                # Tells Docker Compose to build the Docker image using the Dockerfile in the current directory ('.').
    volumes:                # Defines folders to mount between your host and the container for syncing files.
      - ./src:/app/src:ro  # Mounts the local 'src' directory into '/app/src' inside the container as read-only (:ro).  
                            # This means the container can read your source code but cannot modify it.
    ports:                  # Maps network ports between your host machine and the container.
      - "4000:4000"         # Maps port 4000 on your host to port 4000 inside the container, allowing you to access the app at localhost:4000.

```

## 10 <a href="https://www.youtube.com/watch?v=1mQ8NXcHmGk&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=10">Environment Variables</a>

* `docker run --name node-app-container -v "relative-path-on-machine:/app:ro" --env PORT=4000 -d -p 4000:4000 node-app`
This runs the container with a bind mount (read-only) and passes an environment variable PORT=4000 directly into the container.

* `docker run --name node-app-container -v "relative-path-on-machine:/app:ro" --env-file ./.env -d -p 4000:4000 node-app`
This runs the container with the same bind mount, but instead of passing individual variables, it loads all environment variables from a .env file into the container.

* In a Docker Compose file, you can set environment variables like this:

  ```environment:
    - NODE_ENV=development
    - PORT=4000
  env_file:
    - .env
  ```

  Here, environment sets individual environment variables, while env_file loads all variables defined inside the .env file.

## 11 <a href="https://www.youtube.com/watch?v=sbiArlT5hG8&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=11">Docker Environments (Dev, Prod, ...)</a>
1. Run a Specific Compose File
  To run Docker using a specific file (for example, for development):
  `docker-compose -f docker-compose.dev.yml up -d`
  This command tells Docker Compose to use docker-compose.dev.yml and start the containers in the background.

2. Use a Common Base File with Overrides
You can keep all the common configuration (used in both development and production) inside the main docker-compose.yml file.

    Then, you can add environment-specific configurations (like for production) in a second file and use both like this:
    `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
      Use the shared settings from docker-compose.yml Override or add to them using docker-compose.prod.yml. Start the containers in the background

3. Rebuild Images Before Running
To rebuild the Docker images and then start the containers: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
  This forces Docker to build fresh images before running the containers.

## 12 <a href="https://www.youtube.com/watch?v=2-bbh5kmNSc&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=12">Multi-Stage Dockerfile</a>

* can pass argument to docker file like
```
build:
  context: .                         # Tells Docker to use the current directory (.) as the build context
  args:                              # These are build-time arguments (used in the Dockerfile with ARG)
    NODE_ENV: production             # We're passing a build argument named NODE_ENV with the value 'production'

```
```
# Run a conditional npm install based on the NODE_ENV environment variable
RUN if [ "$NODE_ENV" = "production" ]; \                  # Check if we're in production environment
    then \                                                # If true:
        npm install --production; \                       # Install only production dependencies (skip devDependencies)
    else \                                                # Otherwise (e.g., development environment):
        npm install; \                                    # Install all dependencies including devDependencies
    fi                                                    # End of the if-else block
```

* Or , you can define multi staging in the dockerfile and pass the target from the compose file
```
    build:
      context: .
      target: production
```
```
From node:20 as base
From base as development
```

## 13 <a href="https://www.youtube.com/watch?v=XP98uQ_2JIQ&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=13">Docker with MongoDB & NodeJS</a>

* can get network of container by `docker inspect  docker-practise-mongo-1` and can write name of container directly and map to Ip of `mongo`

## 14 <a href="https://www.youtube.com/watch?v=dcrdobTJsLM&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=14">Docker with Mongo-Express</a>
* sync database with the machine so when close container data still there
```
  mongo:
    image: mongo
    restart: always
    volumes:
      - mongo-db:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      
volumes:
    mongo-db:
```
* `docker exec -it docker-practise-mongo-1 mongosh -u root -p example` go inside database
* `docker-compose -f docker-compose.yml -f  docker-compose.dev.yml down -v` that delete volume also

## 15 <a href="https://www.youtube.com/watch?v=hxCNBv0Zx48&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=15">Docker with Redis</a>

* can make container depends on other container so didn't run before it
```
    depends_on:
      - mongo
```

## 16 <a href="https://www.youtube.com/watch?v=8LGESAoR8qI&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=16">Docker with Nginx</a>

*  `default.conf`
```
server {
    # Listen for incoming HTTP requests on port 80 (the default HTTP port)
    listen 80;

    location / {
        # Pass the original client IP to the backend (Node.js app)
        proxy_set_header X-Real-IP $remote_addr;

        # Add client's IP to the X-Forwarded-For header (used in proxies to track original client IP)
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Forward the original Host header (e.g., example.com) to the backend server
        proxy_set_header Host $host;

        # Custom header to identify that the request passed through this Nginx proxy
        proxy_set_header X-Nginx-Proxy true;

        # Forward the request to the backend Node.js app running at http://node-app:4000
        proxy_pass http://node-app:4000;

        # Disable automatic rewriting of the "Location" and "Refresh" headers in the response
        proxy_redirect off;
    }
}

```

## 22 <a href="https://www.youtube.com/watch?v=FivUkFEfTzg&list=PLzNfs-3kBUJnY7Cy1XovLaAkgfjim05RR&index=22">Load Balancing with Nginx</a>

 <img src="./assets//Load Balancing with Nginx.png" width="600px">

**Notes**
 - you have to delete image name from docker compose file
 - you have to delete bind mount


### Docker Networking and DNS Resolution Guide

### 🧠 Understanding the Problem: No DNS in Default `bridge`

Let's say you do this:

```bash
docker run -d --name nginx nginx
docker run -it busybox ping nginx
```

You might expect that `busybox` can just ping `nginx` using the container name.
But instead, you get something like:

```
ping: bad address 'nginx'
```

### ❓ Why?

Because the **default** `bridge` network doesn't include an embedded DNS server that maps container names to IP addresses. So even though both containers are running, they **can't resolve each other's names** unless you manually link them (a deprecated method), or unless you move to a **user-defined bridge** network.

Docker's internal DNS only works for **user-defined bridge** or **overlay** networks. Not the default `bridge`.

### 🛠️ Workaround: Use a Custom Bridge Network

When you create your own network, Docker enables service name resolution via an internal DNS server automatically.

Here's how:

### ✅ Step-by-Step Example

```bash
# Create a custom bridge network
docker network create mynet
```

This gives you:
- A **user-defined bridge** network
- Built-in **DNS-based name resolution** between containers

Then:

```bash
# Run nginx container on 'mynet'
docker run -d --name nginx --network mynet nginx
```

Now run a second container:

```bash
docker run -it --network mynet busybox sh
```

Inside the container:

```bash
ping nginx
```

And now it works!

```
PING nginx (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.062 ms
```

**🎉 Success!** The container `busybox` can resolve `nginx` using its name.

### ⚙️ Why This Works

When you use a **user-defined bridge** network:
- Docker sets up an **internal DNS service** for that network
- Each container gets registered in the DNS
- Docker listens to container name changes and updates DNS entries live
- The containers can resolve each other **by name**, not just by IP

This mimics how containers might discover services in a real-world distributed system.

### 🧪 Optional: Try With Docker Compose

Docker Compose automatically creates a custom network for your services, which means DNS works out-of-the-box.

Example `docker-compose.yml`:

```yaml
version: '3'
services:
  web:
    image: nginx
  app:
    image: busybox
    command: sh -c "ping web"
```

When you run:

```bash
docker-compose up
```

You'll see `app` successfully pinging `web`—because they're on the same custom network.

### 🧩 Real-World Application

Imagine you're building a microservices app with:
- `frontend`
- `backend`
- `database`

You want them to talk to each other like this:

```
frontend → backend → database
```

Using a **custom network** (or Docker Compose) allows you to just call:

```http
http://backend:5000
```

or

```sql
mysql -h database -u root
```

No need to worry about IPs or manual linking—**Docker DNS resolves the names automatically**.

### 🚀 Summary

| Feature | Default Bridge | Custom Bridge |
|---------|---------------|---------------|
| DNS (name → IP) | ❌ Not supported | ✅ Supported |
| Container name resolution | ❌ Manual only | ✅ Automatic |
| Suitable for multi-container | ❌ No | ✅ Yes |
| Can be created via CLI/Compose | ❌ N/A | ✅ Yes |

### Additional Network Commands

### List Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect mynet
```

### Remove Network
```bash
docker network rm mynet
```

### Connect Container to Network
```bash
docker network connect mynet container_name
```

### Disconnect Container from Network
```bash
docker network disconnect mynet container_name
```

## Best Practices

1. **Always use custom networks** for multi-container applications
2. **Use Docker Compose** for development environments
3. **Name your containers meaningfully** since they become DNS hostnames
4. **Use environment variables** for service discovery in production
5. **Consider overlay networks** for multi-host deployments

## Troubleshooting

### Check Container Network Configuration
```bash
docker inspect container_name | grep -i network
```

### Test DNS Resolution Inside Container
```bash
docker exec -it container_name nslookup other_container_name
```

### View Network Configuration
```bash
docker network inspect network_name
```