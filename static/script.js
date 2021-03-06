var socket = io();
let num = Math.floor((Math.random() * 10) + 1);
var form = document.getElementById('form');
var input = document.getElementById('input');
var timeout;

class User {
    constructor(username, userColor) {
        this.username = username;
        this.userColor = userColor;
    }
}

var isTyping = false;

let username = prompt('Choose a username:');
if (!username) username = `anonymous${num}`;

// ================== socket stuff =======================================

socket.emit('new user', new User(username));

socket.on('new user', (user, onlineUsers) => {
    userAlert(`New user connected: ${user.username}.`);
    setUsersOnline(onlineUsers);
});

socket.on('disconnection', (user, onlineUsers) => {
    setUsersOnline(onlineUsers);
    userAlert(`${user.username} disconnected.`);
});

socket.on('chat message', (msg, user) => {
    printTheirMessage(msg, user);
});

socket.on('user typing', (usernameList) => {
    var typingStatus = document.getElementById('typingStatus');
    window.scrollTo(0, document.body.scrollHeight);
        if (usernameList.length === 1){
            typingStatus.textContent = `${usernameList[0]} is typing...`;
        } else if (usernameList.length === 2){
            typingStatus.textContent = `${usernameList[0]} and ${usernameList[1]} are typing...`;
        } else {
            // also a good solution would be to create a comma-separated list with all elements, except the last one, which we separate by an 'and'. but in this scenario, I would consider that not many people would be using this chat
            typingStatus.textContent = 'A few users are typing...'
        }
});

socket.on('stop typing', () =>  typingStatus.textContent = '');

// ================== html stuff =======================================

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value); 
        printMyMessage(input.value);
        input.value = '';
    }
});

input.addEventListener('keyup', () => {
    clearTimeout(timeout);

    // when user does not type anything new for some seconds
    timeout = setTimeout(() => {
        socket.emit('stop typing', username);
    }, 4000);

    input.value ? isTyping = true : isTyping = false;
    isTyping ? socket.emit('user typing', username) : socket.emit('stop typing', username);
});

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

