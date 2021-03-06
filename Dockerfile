FROM ubuntu

# Inspired by Christian Lück <christian@lueck.tv> https://hub.docker.com/r/clue/adminer/~/dockerfile/
MAINTAINER Zeph Grunschlag <zgrunschlag@gmail.com>

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y \
  unixodbc unixodbc-dev freetds-dev freetds-bin tdsodbc

ADD etc_freetds_freetds.conf /etc/freetds/freetds.conf
ADD etc_odbc.ini /etc/odbc.ini
ADD etc_odbcinst.ini /etc/odbcinst.ini

