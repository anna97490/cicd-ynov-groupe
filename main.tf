terraform {
    required_providers {
        docker = {
            source = "kreuzwerker/docker"
            version = "3.0.2"        
        }
    }
}

provider "docker" {}

resource "docker_network" "internal_network"{
    name = "internal-app-network"
}

resource "docker_image" "mongo_image" {
    name = "mongo"

}
resource "docker_container" "mongo_db" {
    name = "mongo_db"
    image = docker_image.mongo_image.image_id
    restart = "always"

    networks_advanced {
        name = docker_network.internal_network.name
    }

    ports {
        external = 27017
        internal = 27017
    }
}

resource "docker_image" "node_image" {
    name = "node"

    build {
        context = "${path.module}"
    }
}

resource "docker_container" "node_server" {
    name = "node_server"
    image = docker_image.node_image.image_id
    restart = "always"

    networks_advanced {
        name = docker_network.internal_network.name
    }

    ports {
        external = 5001
        internal = 5001
    }

    # Volumes
    volumes {
        host_path      = abspath(path.module)
        container_path = "/server"
    }

    volumes {
        container_path = "/server/node_modules"
    }

    # Command to run
    command = ["node", "server.js"]

    # Depends on MongoDB
    depends_on = [docker_container.mongo_db]
}

# Variables
variable "mongodb_url" {
  description = "MongoDB connection string"
  type        = string
}

variable "port" {
  description = "Port used by Node server"
  type        = string
}

