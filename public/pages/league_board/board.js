const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
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

    if (input.value) {
        const msg = mapOutgoingMessage()
        socket.emit('chat message', msg);      
        input.value = '';    
    }

});

// Receive and display
socket.on('chat message', function(msg) {
    displayMessage(msg)
});

function mapOutgoingMessage() {

    const currentDate = new Date();

    // TODO map all dates to add the zero
    const adjustedDay = (currentDay) => {
        if (currentDay < 10) {
            return "0" + currentDay
        } else {
            return currentDay
        }
    }
    const formattedDate = `${adjustedDay(currentDate.getDate())}/${currentDate.getMonth()}/${currentDate.getFullYear()}`;

    const adjustedHour = (currentHour) => {
        if (currentHour < 10) {
            return "0" + currentHour
        } else {
            return currentHour
        }
    }
    const formattedTime = `${adjustedHour(currentDate.getHours())}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`

    return {
        avatar: user.avatar,
        username: user.username,
        content: input.value,
        owner: user.id,
        publishedDate: formattedDate,
        publishedTime: formattedTime
    };
}

function displayMessage(msg) {
    const msgWrapper = document.createElement('li')
    const msgHeader = document.createElement('div')
    const username = document.createElement('div')
    const dateTime = document.createElement('div')
    const msgItem = document.createElement('div')
    const content = document.createElement('div')

    // Display msg left or right.
    //if (msg.owner === user.id) {

    msgWrapper.className = "receiver"

    // Header
    msgHeader.className = 'row msg-header'
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
    msgItem.appendChild(content)

    msgWrapper.appendChild(msgHeader)
    msgWrapper.appendChild(msgItem)
    msgWrapper.append(dateTime)

    messages.appendChild(msgWrapper)

}