const socket = io();

let messages = document.getElementById('messages');
let form = document.getElementById('form');  
let input = document.getElementById('input');
let user = "";

fetch("/board/user")
.then(res => res.json())
.then(userDetails => {
    user = userDetails
})

fetch("/profile/sleeperAvatarUrl")
.then(response => response.text())
.then(avatarURL => {
    user.avatar = avatarURL
})

// Send
form.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const currentDate = new Date();
    // TODO map all dates to add the zero
    const adjustedDay = (currentDay) => {
        if (currentDay < 10) {
            return "0" + currentDay
        }
    }
    const formattedDate = `${adjustedDay(currentDate.getDate())}/${currentDate.getMonth()}/${currentDate.getFullYear()}`;
    
    const adjustedHour = (currentHour) => {
        if (currentHour < 10) {
            return "0" + currentHour
        }
    }
    const formattedTime = `${adjustedHour(currentDate.getHours())}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`
    
    if (input.value) {
        const msg = {
            avatar: user.avatar,
            username: user.username,
            content: input.value,
            publishedDate: formattedDate,
            publishedTime: formattedTime
        }
        socket.emit('chat message', msg);      
        input.value = '';    
    }  
});


// Receive and display
socket.on('chat message', function(msg) {

    const msgHeader = document.createElement('li');
    const username = document.createElement('div')
    const dateTime = document.createElement('div')
    const msgItem = document.createElement('li');
    const content = document.createElement('div')

    // Header
    msgHeader.classList = 'row msg-header'
    username.className = 'msg-username col-7'
    dateTime.className = 'msg-datetime col-2'

    // Message
    msgItem.className = 'row msg-item'
    content.className = 'msg-content col-12'

    // Set content
    if (msg.avatar != null)  {
        const avatar = document.createElement('img')
        avatar.className ='msg-avatar col-1'
        avatar.src = msg.avatar
        msgHeader.appendChild(avatar)
    } else {
        const placeholder = document.createElement('i')
        placeholder.className = 'msg-avatar col-1 fas fa-road'
        msgHeader.appendChild(placeholder)
    }
    
    username.innerText = msg.username
    dateTime.innerText = `
        ${msg.publishedDate}, ${msg.publishedTime}
    `
    content.innerText = msg.content;

    msgHeader.appendChild(username)
    msgHeader.appendChild(dateTime)
    msgItem.appendChild(content)

    messages.appendChild(msgHeader)
    messages.appendChild(msgItem);    
});