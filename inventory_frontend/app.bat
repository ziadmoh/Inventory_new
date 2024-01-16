
start /d "G:\Server" xampp-control.exe

TIMEOUT /T 5
start http://localhost/inventory/#/system/inventory
cd "F:\Freelance\Inventory\inventory_backend\inventory"
node server.js

