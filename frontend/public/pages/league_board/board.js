const socket = io()

const messages = document.getElementById('messages')
const form = document.getElementById('form')
const input = document.getElementById('input')
let user = ""

// Load
document.addEventListener("DOMContentLoaded", getAndDisplayMessages)

// Send
form.addEventListener('submit', function(e) {
    e.preventDefault()

    if (input.value) {
        const msg = mapOutgoingMessage()
        socket.emit('chat message', msg)
        input.value = ''
    }
})

// Receive and display
socket.on('chat message', function(msg) {
    displayMessage(msg)
})


function mapOutgoingMessage() {
    if (!user.avatar) user.avatar = "N/A"

    return {
        avatar: user.avatar,
        username: user.username,
        content: input.value,
        owner: user.id,
    }
}

function displayMessage(msg) {
    const msgListItem = document.createElement('li')
    const msgWrapper = document.createElement('div')
    const msgHeader = document.createElement('div')
    const username = document.createElement('div')
    const msgTimestamp = document.createElement('div')
    const msgContent = document.createElement('div')
    const content = document.createElement('div')

    // Display msg left or right.
    msgListItem.className = "clearfix"

    // Bind data
    username.innerText = msg.username
    msgTimestamp.innerText = msg.publishedTime
    content.innerText = msg.content

    // Shared
    // Message
    msgContent.className = 'msg-item'
    content.className = 'msg-content'

    // Subtitle
    msgTimestamp.className = 'msg-datetime'

    if (msg.owner === user.id) {
        msgWrapper.className = "owner"
    } else {
        // Header
        msgHeader.className = 'msg-header'
        username.className = 'msg-username'

        // Map avatar
        if (msg.avatarURL !== "N/A")  {
            const avatar = document.createElement('img')
            avatar.className ='msg-avatar'
            avatar.src = msg.avatarURL
            msgHeader.append(avatar)
        } else {
            const placeholder = document.createElement('i')
            placeholder.className = 'msg-avatar fas fa-road'
            msgHeader.append(placeholder)
        }

        msgHeader.append(username)
        msgWrapper.append(msgHeader)

    }

    msgContent.append(content)

    msgWrapper.append(msgContent)
    msgWrapper.append(msgTimestamp)

    msgListItem.appendChild(msgWrapper)
    messages.append(msgListItem)

    gotoBottom("messages")

}

function getAndDisplayMessages() {
    fetch("/board/user")
        .then(res => res.json())
        .then(userDetails => user = userDetails)
        .then(
            fetch("/profile/sleeperAvatarUrl")
                .then(response => response.text())
                .then(avatarURL => user.avatar = avatarURL)
        )
        .then(
            fetch("/board/messages")
                .then(res => res.json())
                .then(messages => {
                    messages.forEach(msg => displayMessage(msg))
                })
        )
}

function gotoBottom(id){
    let element = document.getElementById(id)
    element.scrollTop = element.scrollHeight - element.clientHeight
}
