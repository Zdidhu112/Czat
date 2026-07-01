const chatInput = document.querySelector(".msgInputDiv input");
const chatMessages = document.querySelector(".messagesBox");
const roomName = document.querySelector(".chatNameBox .chatName");
const userList = document.querySelector(".activeBox ul");
const activeUsersNumber = document.querySelector(".activeInfo span span");
const chatListPrivate = document.querySelector(".chatList.private");
const chatListPublic = document.querySelector(".chatList.public");
const listShowPublic = document.querySelector("#listShowPublic");
const listShowPrivate = document.querySelector("#listShowPrivate");
const roomName2 = document.querySelector(".infoBox .chatName");
let roomSearchInput = document.querySelector("#roomSearchInput");
const modalBox = document.querySelector(".modalBox");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".closeModal");
const showModalBtn = document.querySelector("#addChat");
const usersDiv = document.querySelector("#users");
const roomType = document.querySelector("#roomType");
const roomNameInput = document.querySelector("#roomName");
const saveRoom = document.querySelector("#createRoom");
const userSearchInput = document.querySelector("#userSearchInput");
const emojiPickerBtn = document.querySelector("#emojiPickerBtn");
const emojiPicker = document.querySelector(".emojiPicker");
const { room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
const roomId = room;

const socket = io();
let myId;
loadRooms();
loadUsers();
if (roomId) {
    socket.emit("joinRoom", roomId);
} else {
    roomName.textContent = "Wybierz czat";
    roomName2.textContent = "Wybierz czat";
}
socket.on("id", id => {
    myId = id;

})
socket.on("roomUsers", ({ users, name, }) => {
    if (name) {
        roomName.textContent = name;
        roomName2.textContent = name;
    }
    renderUsers(users);
});

socket.on("chatHistory", messages => {
    chatMessages.innerHTML = "";
    messages.forEach(renderMessage);
    scrollToBottom();
});

socket.on("message", message => {
    renderMessage(message);
    scrollToBottom();
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;

    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit("chatMessage", text);
    chatInput.value = "";
});

function renderMessage(message) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message");

    if (message.user === myId) {
        wrapper.classList.add("my");
    }

    const info = document.createElement("div");
    info.classList.add("msgInfo");

    const author = document.createElement("span");
    author.classList.add("msgAuthor");
    author.textContent = message.username;

    const time = document.createElement("span");
    time.textContent = message.time || "";

    info.appendChild(author);
    info.appendChild(time);

    const box = document.createElement("div");
    box.classList.add("singleMsgBox");

    const actions = document.createElement("div");
    actions.classList.add("msgActions");

    const react = document.createElement("span");
    react.classList.add("material-symbols-outlined");
    react.textContent = "add_reaction";

    const share = document.createElement("span");
    share.classList.add("material-symbols-outlined");
    share.textContent = "ios_share";

    actions.appendChild(react);
    actions.appendChild(share);

    const text = document.createElement("div");
    text.classList.add("msgText");
    text.textContent = message.text;

    box.appendChild(actions);
    box.appendChild(text);

    wrapper.appendChild(info);
    wrapper.appendChild(box);

    chatMessages.appendChild(wrapper);
}

function renderUsers(users) {
    activeUsersNumber.textContent = users.length;
    userList.innerHTML = "";

    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user.username;
        userList.appendChild(li);
    });
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
async function loadRooms() {
    if (!chatListPrivate || !chatListPublic) return;

    try {
        const rooms = await fetch("/rooms/api").then(res => res.json());

        rooms.forEach(room => {
            const li = document.createElement("li");
            li.className = "el";
            if (room._id == roomId) li.classList.add("actual");
            li.dataset.id = room._id;

            const icon = document.createElement("div");
            icon.className = "icon";

            const iconSpan = document.createElement("span");
            iconSpan.className = "material-symbols-outlined";
            iconSpan.textContent = room.type === "private" ? "face" : "group";

            icon.appendChild(iconSpan);

            const info = document.createElement("div");
            info.className = "info";

            const name = document.createElement("div");
            name.className = "chatName";
            name.textContent = room.name;

            const last = document.createElement("div");
            last.className = "lastMessage";
            last.textContent = room.lastMessage || "Kup piwo piwo piwo piwo piwo piwo";

            info.append(name, last);

            const time = document.createElement("div");
            time.className = "time";
            time.textContent = room.lastMessageTime || "12:50";

            li.append(icon, info, time);

            li.addEventListener("click", () => {
                window.location.href = "/chat?room=" + room._id;
            });
            if (room.type === 'public') {
                chatListPublic.appendChild(li);
            } else {
                chatListPrivate.appendChild(li);

            }
        });

    } catch (err) {
        console.error(err);
    }
}
async function loadUsers() {
    const users = await fetch("/rooms/api/users")
        .then(res => res.json());
    users.forEach(user => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = user._id;

        const span = document.createElement("span");
        span.textContent = user.name;

        label.append(input, span);

        usersDiv.append(label);
    });
}
if (roomType.value === "private") {
        usersDiv.style.display = "block";
        userSearchInput.disabled = false;
        userSearchInput.placeholder = "Publiczny czat jest dostępny dla wszystkich";
    } else {
        usersDiv.style.display = "none";
        userSearchInput.disabled = true;
        userSearchInput.placeholder = "Wyszukaj użytkownika";
    }
roomType.onchange = () => {
    if (roomType.value === "private") {
        usersDiv.style.display = "block";
        userSearchInput.disabled = false;
        userSearchInput.placeholder = "Publiczny czat jest dostępny dla wszystkich";
    } else {
        usersDiv.style.display = "none";
        userSearchInput.disabled = true;
        userSearchInput.placeholder = "Wyszukaj użytkownika";
    }
}
saveRoom.onclick = async () => {
    const members = [
        ...document.querySelectorAll(
            "#users input:checked"
        )
    ].map(x => x.value);
    console.log(members);

    const res = await fetch("/rooms/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: roomNameInput.value,
            type: roomType.value,
            members
        })
    });
    console.log(res);
    const room = await res.json();
    console.log(room);
    if (!room._id) return;
    window.location.href = "/chat?room=" + room._id;
}
listShowPrivate.addEventListener("click", (e) => {
    if (listShowPrivate.classList.contains("active")) {
        listShowPrivate.classList.remove("active");
        listShowPublic.classList.add("active");
        chatListPrivate.style.display = 'none';
        chatListPublic.style.display = 'flex';
    } else {
        listShowPublic.classList.remove("active");
        listShowPrivate.classList.add("active");
        chatListPublic.style.display = 'none';
        chatListPrivate.style.display = 'flex';
    }
})
listShowPublic.addEventListener("click", (e) => {
    if (listShowPrivate.classList.contains("active")) {
        listShowPrivate.classList.remove("active");
        listShowPublic.classList.add("active");
        chatListPrivate.style.display = 'none';
        chatListPublic.style.display = 'flex';
    } else {
        listShowPublic.classList.remove("active");
        listShowPrivate.classList.add("active");
        chatListPublic.style.display = 'none';
        chatListPrivate.style.display = 'flex';
    }
})
console.log(roomSearchInput);

roomSearchInput.addEventListener("input", (e) => {
    roomSearch(roomSearchInput, chatListPrivate, ".chatName");
    roomSearch(roomSearchInput, chatListPublic, ".chatName");
})
function roomSearch(inp, list, nameBox) {
    const value = inp.value.trim().toUpperCase();

    [...list.children].forEach(el => {
        const name = el.querySelector(nameBox).textContent.toUpperCase();
        el.style.display = name.includes(value) ? "" : "none";
    });
}
showModalBtn.addEventListener("click", (e) => {
    modalBox.style.display = "flex";
})
modalBox.addEventListener("click", (e) => {
    if (!e.target.closest(".modal")) {
        modalBox.style.display = "none";
    }
})
modalClose.addEventListener("click", (e) => {
    modalBox.style.display = "none";
})
userSearchInput.addEventListener("input", (e) => {
    roomSearch(userSearchInput, usersDiv, "label span");
})
emojiPickerBtn.addEventListener("click", (e) => {
    if (emojiPicker.classList.contains("hidden")) {
        emojiPicker.classList.remove("hidden");
    } else {
        emojiPicker.classList.add("hidden");
    }
})
emojiPicker.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        chatInput.value = chatInput.value.slice(0, chatInput.selectionStart) + e.target.textContent + chatInput.value.slice(chatInput.selectionStart);
        emojiPicker.classList.toggle("hidden");

    }
})