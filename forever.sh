forever stopall

export NODE_ENV=production
export DEBUG=* 

forever --killSignal=SIGTERM start -l /var/www/logs/apiserver.log --append index.js
forever --killSignal=SIGTERM start -l /var/www/logs/socketserver.log --append socket.js
