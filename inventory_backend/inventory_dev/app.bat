
start /d "E:\xampp" xampp-control.exe

TIMEOUT /T 7
start http://localhost/inventory/#/system/inventory
cd "D:\inventory_backend"
node server.js

