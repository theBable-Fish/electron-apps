// JavaScript source code
const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set Env
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function() {
	//Create new window
	mainWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}});
	//Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	// Quit app when closed
	mainWindow.on('closed', function(){
		app.quit();
	});


	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu)
});

// Handle createAddWindow
function createAddWindow(){
	//Create new window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title:'Add Shopping List Item',
		webPreferences: {nodeIntegration: true} 
	});
	//Load html into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	// Garbage collection handle
	addWindow.on('close', function(){
		addWindow = null;
	});
};

// Catch item:add
ipcMain.on('item:add',function(e, item){
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
})

const mainMenuTemplate = [
	{
		label:'File',
		submenu: [{
			label: 'Add Item',
				accelerator: process.platform == 'darwin' ? 'Command+N' : 'CTRL+N',
				click(){
					createAddWindow();
				}},{
				label: 'Remove Item',
				accelerator: process.platform == 'darwin' ? 'Command+R' : 'CTRL+R',
				click(){
					mainWindow.webContents.send('item:clear')
				}
			},{
			label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'CTRL+Q',
				click(){
					app.quit();
				}}]}];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

// add devloper tools item if not in prod
if(process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [{
			label: 'Toggle DevTools',
			accelerator: process.platform == 'darwin' ? 'Command+I' : 'CTRL+I',
			click(item, focusedWindow){
				focusedWindow.toggleDevTools();
			}},
		{role: 'reload'}
		]
	});
}