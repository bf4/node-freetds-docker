# FreeTDS and ODBC Configuration

### Date of this README: March 8, 2016

This project is a proof of concept that let's you connect to an **MS SQL Server** database from inside of a Docker.
As I have experienced numerous frustrations whenever I have to work on Windows boxes (I won't bore you
with my tedious and long list of complaints), I strive to do as much as possible work in a non-Windows environment.
But sometimes you have to work with the infrastructure that you already have, for example an **MS SQL Server** database.
By deploying this project and building the `Dockerfile_node` image included in it, you will be able to 
connect to your **MS SQL Server** database and query as you like.

### NOTE:

The various FreeTDS configurations were hard to get right. Finally [FlipperPA](http://stackoverflow.com/questions/33341510/how-to-install-freetds-in-linux)
and his [Git Repo](https://github.com/FlipperPA/django-python3-vagrant/tree/master/examples) did the trick.

## To get the Project working

Follow the directions below for how to build and run the docker images. As this just a POC you'll need to decide
how to best use the Docker. Probably the simplest is to use the included `testSqlServer.js` script as a starting point
and run your code inside the Docker. Alternately, you could modify the Docker and use it as a generic bridge to your
**MS SQL Server** database with your business logic residing outside.
Note, that I've only included the most basic Node functionality. The current popular options are:
* [node-mssql](https://www.npmjs.com/package/mssql) - what I'm using here
* [connect-mssql](https://github.com/patriksimek/connect-mssql) - Connect/Express session store
* [co-mssql](https://github.com/patriksimek/co-mssql) - Generator friendly wrapper of `node-mssql`

### CLEARLY YOU CAN'T EXPECT THE DOCKER CONTAINERS TO RUN OUT OF THE BOX
That is because you have to provide your particular connection information. Search and replace the following
terms throughout this project before attempting any build:
* THE-DB-HOST-ALIAS: should be a name you define in `freetds.conf` that will be referred to by `tsql` and by `odbc.ini`
* THE-DB-HOST-ALIASODBC: a name you define in `odcb.ini` that will be reffered toi by `isql`
* THE-DB-HOST: defined in various places, representing that actual connection url to the MS SQL Server DB
* THE-DB-USER: the database user that will be granted access to the DB
* THE-PASSWORD or THE-DB-PASSWORD-WHICH-I-WONT-WRITE-HERE: the database user's password
* db: the database to connect to initially (Like calling `USE db;` as the first step)

## Installation command on Ubuntu:
```
sudo apt-get install unixodbc unixodbc-dev freetds-dev freetds-bin tdsodbc
```

## Configuration file locations:

* `/etc/freetds/freetds.conf`
* `/etc/odbc.ini`
* `/etc/odbcinst.ini`


## Test *Free TDS*

```
tsql -H THE-DB-HOST-ALIAS -U CW_USR -p 1433
```
After entering the password, you should get the magical `1>` prompt rather than the infuriating timer

## Test *iODBC*

```
isql THE-DB-HOST-ALIASODBC CW_USR THE-DB-PASSWORD-WHICH-I-WONT-WRITE-HERE
```

Rather than a nasty error message you sould see the awe inspiring `Connected!` box of wonder:

```
+---------------------------------------+
| Connected!                            |
|                                       |
| sql-statement                         |
| help [tablename]                      |
| quit                                  |
|                                       |
+---------------------------------------+
```

## Test *node's mssql* inside the `tzaffi/nodefreetds` docker container described below:

```
> cd /tzaffimmsql
> node testSqlServer.js

connectString is:
mssql://THE-DB-USER:THE-PASSWORD@THE-DB-HOST/THE-DB
sql is:
[object Object]
[ { ClientID: 12,
    UNI: 'JohnSmith',
    PIDM: 1138,
    FormalTitle: 'Prof.',
    FirstName: 'John',
    MiddleName: 'J',
    Lastname: 'Smith',
    Email: 'jsmith@mail.com',
    Phone: null,
    Staff: true,

...
```

## Build the docker image
```
sudo docker build -t tzaffi/freetds .
```
or for the Node enabled version:
```
sudo docker build -f Dockerfile_node -t tzaffi/nodefreetds .
```

## Run the docker container and then test that it all works
```
sudo docker run --name freetds -it --rm tzaffi/freetds bin/bash
```
or for the Node enabled version:
```
sudo docker run --name nodefreetds -it --rm tzaffi/nodefreetds
```

Here's a sample interactive session testing both *FreeTDS* (using `tsql`) and *ODBC* (using `isql`):
```
root@757c3a5b3850:/# tsql -H THE-DB-HOST-ALIAS -U CW_USR -p 1433
Password:
locale is "C"
locale charset is "ANSI_X3.4-1968"
using default charset "ISO-8859-1"
1> USE lweb_tc_columbia_edu
2> GO
1> SELECT TOP 2 * FROM Client
2> GO
PIDM	UNI	Confidentiality	Prefix	FirstName	MiddleName	LastName	Suffix
142	jSmith	0		Ms.	Joan		NULL		Smith   	NULL
337	eJane	0		Ms.	Elizabeth	Donna		Jane		NULL
(2 rows affected)
1> exit
\root@757c3a5b3850:/# isql THE-DB-HOST-ALIASODBC CW_USR THE-DB-PASSWORD-WHICH-I-WONT-WRITE-HERE
+---------------------------------------+
| Connected!                            |
|                                       |
| sql-statement                         |
| help [tablename]                      |
| quit                                  |
|                                       |
+---------------------------------------+
SQL> USE lweb_tc_columbia_edu;
[ISQL]INFO: SQLExecute returned SQL_SUCCESS_WITH_INFO
SQLRowCount returns -1
SQL> SELECT TOP 2 * FROM Client;
+------------+---------------------+----------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+
| PIDM       | UNI                 | Confidentiality| Prefix                                            | FirstName                                         | MiddleName                                        | LastName                                          | Suffix                                            |
+------------+---------------------+----------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+
| 142        | jSmith              | 0              | Ms.                                               | Joan                                              |                                                   | Smith                                             |                                                   |
| 337        | eJane               | 0              | Ms.                                               | Elizabeth                                         | Donna                                             | Jane                                              |                                                   |
+------------+---------------------+----------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+---------------------------------------------------+
SQLRowCount returns 2
2 rows fetched
SQL> quit
root@591904ec1bdf:/# exit
exit
```
