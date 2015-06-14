#!/bin/bash
 
PROG=`basename $0`

usage() {
  echo "$PROG usage:"
  echo
  echo "-H	Print this help and exit"
  echo "-U	User Account"
  echo "-d	Database name to create"
  echo "-h	Hostname"
  echo "-p	Port"
  echo "-g	Group"
  echo "-t  Type of database to create"
  echo "-r  Dir of psql binaries"
  echo "-x  Dir of xtuple database files"
  echo
}
 
#Process the arguments
while getopts U:Hd:h:p:g:t:r:x: opt
do
   case "$opt" in
      U) PGUSER=$OPTARG;;
      H) usage;;
      d) ORGNAME=$OPTARG;;
      h) DBSERVERHOST=$OPTARG;;
      p) PORT=$OPTARG;;
      g) GROUPNAME=$OPTARG;;
      t) DATABASETYPE=$OPTARG;;
      r) BINARYDIR=$OPTARG;;
      x) XTUPLEDBDIR=$OPTARG;;
      \?) usage;;
   esac
done

# backup files need to be in the directory as specified by the config.js file
# and need to be named
# demo-current.backup
# quickstart-current.backup
# empty-current.backup

# TODO: dynamically get these via wget
BACKUPFILE=$XTUPLEDBDIR'/'$DATABASETYPE'-current.backup' 

if [ $BINARYDIR = "implicit" ]; then
  $BINARYDIR=""
fi

DROPCOMMAND=$BINARYDIR"dropdb"
CREATECOMMAND=$BINARYDIR"createdb"
RESTORECOMMAND=$BINARYDIR"pg_restore"
PSQLCOMMAND=$BINARYDIR"psql"

echo '$DROPCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT $ORGNAME'
echo '$CREATECOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -T template1 $ORGNAME'
echo '$RESTORECOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME $BACKUPFILE'
echo '$PSQLCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME -c "CREATE ROLE xtrole"'
echo '$PSQLCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME -c "CREATE ROLE $GROUPNAME"'
$DROPCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT $ORGNAME
$CREATECOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -T template1 $ORGNAME
$RESTORECOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME $BACKUPFILE
$PSQLCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME -c "CREATE ROLE xtrole"
$PSQLCOMMAND -U $PGUSER -h $DBSERVERHOST -p $PORT -d $ORGNAME -c "CREATE ROLE $GROUPNAME"
