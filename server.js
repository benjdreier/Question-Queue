var WebSocketServer = require('websocket').server;
var http = require('http');
var static = require('node-static');


var clients = {};
var client_count = 0;

let port = process.env.PORT || 8000;
var file = new static.Server();

var server = http.createServer(function(request, response){
	console.log(request.url);
	if(request.url == "/"){
		file.serveFile("/index.html", 200, {}, request, response);
	}
	else{
		request.addListener('end', function() {
			file.serve(request, response);
		}).resume();
	}
	
});

server.listen(port, function() {
	console.log((new Date()) + "Server is listening on port " + port);
});

wsServer = new WebSocketServer({
	httpServer : server
});

questionList = [];

function removeQuestion(id){
	for(i in questionList){
		if(questionList[i]){
			if(questionList[i].id == id){
				delete questionList[i];
				console.log("Removed question from id " + id);
				console.log("At position " + i);
				updateClientLists();
				return 0;
			}
		}
	}
	console.log("No question found to remove with id " + id);
	return 1;
}

wsServer.on('request', function(request) {
	console.log("Connection from origin " + request.origin);
	var connection = request.accept(null, request.origin);
	var id = client_count++;
	clients[id] = connection;
	console.log("Connection accepted with id " + id);
	connection.send(JSON.stringify({type:"id", id: id}));
	updateClientLists();

	connection.on('message', function(message){
		var json = JSON.parse(message.utf8Data);
		if(json.type == "name"){
			clients[id].username = json.name;
			console.log(clients);
		}
		// else if(json.type == "message"){
		// 	console.log("Message recieved from " + json.sender);
		// 	console.log(json.message);
		// 	updateClients(message.utf8Data);
		// }
		else if(json.type == "questionUp"){
			newQuestion = {id: json.senderId, name: json.sender, text: json.message};
			questionList.push(newQuestion);
			updateClientLists();
		}
		else if(json.type == "questionDown"){
			removeQuestion(json.senderId);
		}
	})

	connection.on('close', function(connection) {
		console.log("Disconnection from " + connection);
		console.log("With ID: " + id);
		delete clients[id];
		removeQuestion(id);
	})
})

function updateClients(message){
	for (var i in clients) {
		clients[i].sendUTF(message);
	}
}

function updateClientLists(){
	updateClients(JSON.stringify({type:"listUpdate", list:questionList}));
}