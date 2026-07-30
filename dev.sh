#!/bin/bash
# dev.sh
set -e
set -a
set +a

COMPOSE="docker compose"


if [ "$1" == "up" ]; then
    $COMPOSE up -d
    $COMPOSE logs -f
elif [ "$1" == "rebuild" ]; then
    $COMPOSE build api --no-cache
    $COMPOSE up -d
elif [ "$1" == "sh" ]; then
  $COMPOSE exec api sh
elif [ "$1" == "install" ]; then
  shift
  $COMPOSE exec api npm install "$@"
elif [ "$1" == "npm" ]; then
  shift
  $COMPOSE exec api npm "$@"
elif [ "$1" == "nest" ]; then
  shift
  $COMPOSE exec api npx nest "$@"
elif [ "$1" == "logs" ]; then
  $COMPOSE logs -f api
elif [ "$1" == "build" ]; then
  $COMPOSE build
elif [ "$1" == "down" ]; then
  $COMPOSE down
elif [ "$1" == "stop" ]; then
  $COMPOSE stop
elif [ "$1" == "migration:generate" ]; then
  shift
  $COMPOSE exec api npm run migration:generate -- "db/migrations/$1"
elif [ "$1" == "migration:run" ]; then
  $COMPOSE exec api npm run migration:run
elif [ "$1" == "migration:revert" ]; then
  $COMPOSE exec api npm run migration:revert
elif [ "$1" == "migration:show" ]; then
  $COMPOSE exec api npm run migration:show
else
  echo "Uso: ./dev.sh [up|sh|install <paquete>|npm <comando>|nest <comando>|logs|down|stop|build|migration:generate <nombre>|migration:run|migration:revert|migration:show|db:reset]"
fi

# ./dev.sh up                                levantar todo
# ./dev.sh sh                                entrar a una shell del contenedor
# ./dev.sh install @nestjs/config            instalar dependencia
# ./dev.sh npm run test                      correr cualquier script npm
# ./dev.sh migration:generate AddUsersTable  generar migración
# ./dev.sh migration:run                     aplicar migraciones pendientes
# ./dev.sh migration:revert                  revertir la última migración
# ./dev.sh migration:show                    ver estado de migraciones
# ./dev.sh db:reset                          borrar DB y volver a migrar desde cero