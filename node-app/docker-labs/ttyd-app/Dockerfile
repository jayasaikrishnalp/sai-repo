FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://github.com/tsl0922/ttyd/releases/download/1.6.3/ttyd.x86_64 \
    && chmod +x ttyd.x86_64 \
    && mv ttyd.x86_64 /usr/local/bin/ttyd

EXPOSE 7681 2375

CMD ["ttyd", "-p", "7681", "bash"]
