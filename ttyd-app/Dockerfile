# Use Docker-in-Docker as base
FROM docker:dind

# Install ttyd and other tools
RUN apk update && apk add --no-cache ttyd bash

# Set DOCKER_HOST to ensure the client connects to the daemon
ENV DOCKER_HOST=tcp://127.0.0.1:2375

# Expose ttyd (7681) and Docker API (2375)
EXPOSE 7681 2375

# Start both Docker daemon and ttyd
CMD ["sh", "-c", "rm -f /var/run/docker.pid && dockerd -H tcp://0.0.0.0:2375 --tls=false & ttyd --writable bash"]
