var socket = io();
let num = Math.floor((Math.random() * 10) + 1);
var form = document.getElementById('form');
var input = document.getElementById('input');

class User {
    constructor(username, userColor) {
        this.username = username;
        this.userColor = userColor;
    }
}

var isTyping = false; // define locally if a user is typing. if so, broadcast this as an event

let username = prompt('Choose a username:');
if (!username) username = `anonymous${num}`;

socket.emit('new user', new User(username));

socket.on('new user', (user, onlineUsers) => {
    userAlert(`New user connected: ${user.username}.`);
    setUsersOnline(onlineUsers);
});

socket.on('disconnection', (user, onlineUsers) => {
    setUsersOnline(onlineUsers);
    userAlert(`${user.username} disconnected.`);
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value); 
        printMyMessage(input.value);
        input.value = '';
    }
});

socket.on('chat message', (msg, user) => {
    printTheirMessage(msg, user);
});

input.addEventListener('keyup', () => {
    // FIX: add a timeout for when user does not type anything new
    input.value ? isTyping = true : isTyping = false;
    isTyping ? socket.emit('user typing', username) : socket.emit('stop typing', username);
});

socket.on('user typing', (username) => {
    var typingStatus = document.getElementById('typingStatus');
    window.scrollTo(0, document.body.scrollHeight);
    typingStatus.textContent = `${username} is typing...`;
});

socket.on('stop typing', () =>  typingStatus.textContent = '');

function userAlert (event) {
    var alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = event;
    messages.appendChild(alert);
    window.scrollTo(0, document.body.scrollHeight);
}

function printMyMessage (message) {
    var newMessage = document.createElement('p');
    newMessage.className = 'from-me';
    newMessage.textContent = message;
    messages.appendChild(newMessage);
    window.scrollTo(0, document.body.scrollHeight);
}

function printTheirMessage (message, user) {
    var newMessage = document.createElement('p');
    newMessage.className = 'from-them';
    newMessage.textContent = message;
    newMessage.innerHTML = `<em class="${user.userColor}">${user.username}</em> <br>` + message;
    messages.appendChild(newMessage);
    window.scrollTo(0, document.body.scrollHeight);
}

function setUsersOnline (objectList) { // we use the list of users alongside with their properties
    listUsers = [];
    const text = 'Users online: ';
    var usersOn = document.getElementById('usersOnline');
    objectList.forEach(user => {
        listUsers.push(`<em class="${user.userColor}">${user.username}</em>`);
    });
    usersOn.innerHTML = text + (listUsers).join(', ');
}

