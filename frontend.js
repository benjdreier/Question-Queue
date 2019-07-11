//$(function() {

console.log("Hello World!");
var currentName = "User";
var myId = -1;

var currentUsers = 0;
window.WebSocket = window.WebSocket || window.MozWebSocket;

// if browser doesn't support WebSocket, just show
// some notification and exit
if (!window.WebSocket) {
	content.html($('<p>',
	  { text:'Sorry, but your browser doesn\'t support WebSocket.'}
	));
	input.hide();
	$('span').hide();
	//return;
}


// Connection via heroku
// FOR AFTER MIGRATION I GUESS
//var connection = new WebSocket('wss://damp-savannah-54651.herokuapp.com');

// TEST CONNECTION via localhost
//if(!connection){
	connection = new WebSocket('ws://localhost:8000');
//}

console.log(connection);



connection.onmessage = function(message){
	try {
    	var json = JSON.parse(message.data);
    } 
    catch (e) {
    	console.log('Invalid JSON: ', message);
    	//return;
    }
    if(json.type == "message"){
    	console.log(json.message);
    	console.log(json.sender);

    	let queueList = document.getElementById("queueList");
    	var newEntry = document.createElement("li");
    	newEntry.appendChild(document.createTextNode(json.sender + ": " + json.message));
    	newEntry.setAttribute("class", "list-group-item");
    	queueList.appendChild(newEntry);
    }
    else if(json.type == "listUpdate"){
    	let questionList = json.list;
    	let queueList = document.getElementById("queueList");
    	queueList.innerHTML = "";
    	console.log(questionList);

    	for(i in questionList){
    		if(questionList[i]){
	    		var newEntry = document.createElement("li");
	    		newEntry.appendChild(document.createTextNode(questionList[i].name + ": " + questionList[i].text));
	    		newEntry.setAttribute("class", "list-group-item");
	    		queueList.appendChild(newEntry);
	    	}
    	}
    }
    else if(json.type = "id"){
    	console.log("HELLO????");
    	myId = json.id;
    }
}


function nameSubmit(){
	let nameBox = document.getElementById("nameInput");
	currentName = nameBox.value;
	let nameDisplay = document.getElementById("nameDisplay");
	nameDisplay.innerText = "Hello, " + currentName;
	console.log(currentName);

	let json = JSON.stringify({type: "name", name: currentName});
	connection.send(json)
}

var flagUp = false;
function messageSubmit(){
	let messageSubmit = document.getElementById("submitMessage");
	let messageBox = document.getElementById("messageInput");
	var json = "";
	
	if(!flagUp){
		messageSubmit.value = "Put question flag down";
		flagUp = true;
		json = JSON.stringify({type: "questionUp", message: messageBox.value, sender: currentName, senderId: myId});
	}
	else{
		messageSubmit.value = "Raise question flag";
		flagUp = false;
		json = JSON.stringify({type: "questionDown", sender: currentName, senderId : myId});
	}

	connection.send(json);
}





//})