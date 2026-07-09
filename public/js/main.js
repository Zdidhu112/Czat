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
const showModalBtn = document.querySelector("#addChat");
const usersDiv = document.querySelector("#users");
const roomType = document.querySelector("#roomType");
const roomNameInput = document.querySelector("#roomName");
const saveRoom = document.querySelector("#createRoom");
const userSearchInput = document.querySelector("#userSearchInput");
const emojiPickerBtn = document.querySelector("#emojiPickerBtn");
const emojiPicker = document.querySelector(".emojiPicker");
const chatInfoShowBtn = document.querySelector("#chatInfoShowBtn");
const rightSidebar = document.querySelector(".rightSidebar");
const leftSidebar = document.querySelector(".leftSidebar");
const main = document.querySelector(".main");
const createRoomModal = document.querySelector(".createRoom");
const replyMessageModal = document.querySelector(".replyMessage");
const chatSettingsModal = document.querySelector(".chatSettings");
const chatMembersModal = document.querySelector(".chatMembers");
const modalRoomsList = document.querySelector("#modalRoomsList");
const roomToReplySearchInput = document.querySelector("#roomToReplySearchInput");
const openSettingsBtn = document.querySelector("#openSettingsBtn");
const deleteRoomBtn = document.querySelector(".deleteRoomBtn");
const root = document.querySelector(':root');
const themeInputBox = document.querySelector('.themeInputBox');
const saveRoomSettingsBtn = document.querySelector('.saveRoomSettingsBtn');
const changeChatName = document.querySelector('#changeChatName');
const msgSBox = document.querySelector('.rightSidebar .inputDiv');
const messageSearchInput = msgSBox.querySelector('#messageSearchInput');
const openMsgSearch = document.querySelector('#openMsgSearch');
const addMemberBtn = document.querySelector('.addMemberBtn');
const openMembersBtn = document.querySelector('#openMembersBtn');
const chatMembers = document.querySelector('.chatMembers');
const membersList = document.querySelector('.membersList');

const addMembersModal = document.querySelector(".addMembers");
const membersToAddList = document.querySelector("#membersToAddList");
const memberSearchInput = document.querySelector("#memberSearchInput");
const addMembersSendBtn = document.querySelector("#addMembersBtn");
const sendMsgBtn = document.querySelector("#sendMsgBtn");
const { room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
let users = [];
const themeMap = [
    "light",
    "dark",
    "amoled",
    "ocean",
    "forest",
    "purple",
    "sunset",
    "sakura",
    "nord",
    "dracula",
    "solarizedLight",
    "solarizedDark",
    "rose",
    "orange",
    "emerald",
    "leo",
    "banan",
    "plesn",
    "tigiCookie",
    "mystery"
];
const themes = {
    light: ["#FFFFFF", "#0866FF", "rgba(226,229,233,.5)", "#000000", "#ffffff"],
    dark: ["#1E1F22", "#5865F2", "rgba(43,45,49,.9)", "#FFFFFF", "#c7cbd1"],
    amoled: ["#000000", "#02a8bb", "rgba(20,20,20,.95)", "#FFFFFF", "#e2e8f0"],
    ocean: ["#0B1F33", "#00B8D9", "rgba(22,50,79,.85)", "#F0F9FF", "#cfe3f0"],
    forest: ["#0F1A14", "#4CAF50", "rgba(28,42,32,.85)", "#EAF4EC", "#cfe0d6"],
    purple: ["#18122B", "#A855F7", "rgba(57,48,83,.85)", "#F7F7F7", "#d2cbe6"],
    sunset: ["#2B1B17", "#FF7043", "rgba(74,46,42,.85)", "#FFF4E6", "#e6d2c8"],
    sakura: ["#FFF1F5", "#EC4899", "rgba(255,228,236,.8)", "#4A2C38", "#6b4a56"],
    nord: ["#2E3440", "#88C0D0", "rgba(59,66,82,.9)", "#ECEFF4", "#cfd6e0"],
    dracula: ["#282A36", "#BD93F9", "rgba(68,71,90,.9)", "#F8F8F2", "#cfcfe6"],
    solarizedLight: ["#FDF6E3", "#B58900", "rgba(238,232,213,.8)", "#073642", "#4f5d63"],
    solarizedDark: ["#002B36", "#268BD2", "rgba(7,54,66,.85)", "#EEE8D5", "#c9d3c1"],
    rose: ["#FFF5F7", "#E11D48", "rgba(255,228,236,.8)", "#3F0D1E", "#6a2b3b"],
    orange: ["#FFF8F1", "#F97316", "rgba(255,237,213,.75)", "#3B2413", "#6a3b1f"],
    emerald: ["#ECFDF5", "#10B981", "rgba(209,250,229,.75)", "#064E3B", "#2f6b57"],

    // 🔥 Twoje motywy:
    leo: ["#f9c850", "#563915", "rgb(0 0 0 / 85%)", "#fffef3", "#fff7e3"],
    banan: ["#fff494", "#d9c568", "rgb(208 197 146 / 85%)", "#604d00", "#5b4700"],
    plesn: ["#cbd0bf", "#a1855c", "rgb(131 146 80 / 85%)", "#212121", "#262626"],
    tigiCookie: ["#ffe4b4", "#8b7351", "rgb(173 119 59 / 85%)", "#623c00", "#2e1700"],
    mystery: ["#d9f0ff", "#c3c8ff", "rgb(239 253 255 / 85%)", "#8d90ff", "#7893d0"]
};
let loadingMessages = false;
let hasMoreMessages = true;
let oldestMessageDate = null;
const roomId = room;
let roomData;
let rooms = [];
const socket = io();
let myId, actReplyId, activeTheme;
init()
async function init() {
    await loadRooms();
    await loadUsers();
    roomsListCreate();
}
if (roomId) {
    socket.emit("joinRoom", roomId);
} else {
    roomName.textContent = "Wybierz czat";
    roomName2.textContent = "Wybierz czat";
    openSettingsBtn.disabled = true;
}
socket.on("roomInfo", (info) => {
    myId = info.id;
    roomData = info.roomData;
    changeChatName.value = roomData.name;
    if (roomData.type === 'public') {
        listShowPublic.click()
    }
    if (roomData.name) {
        roomName.textContent = roomData.name;
        roomName2.textContent = roomData.name;
    }
    if (roomData.theme) {
        console.log(roomData.theme);

        selectTheme(roomData.theme)
    } else {
        selectTheme(1)
    }
    renderMembers();

})
socket.on("roomUsers", ({ users }) => {
    renderUsers(users);
});

socket.on("chatHistory", messages => {
    chatMessages.innerHTML = "";
    messages.reverse().forEach(renderMessage);
    scrollToBottom();
    if (messages.length) {
        oldestMessageDate = messages[0].createdAt;
    }
    hasMoreMessages = messages.length === 10;
});

socket.on("message", message => {
    renderMessage(message);
    scrollToBottom();
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;
    sendMsg();

});
sendMsgBtn.addEventListener("click", (e) => {
    sendMsg();
})
function sendMsg() {
    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit("chatMessage", text);
    chatInput.value = "";
}
function createMessage(message) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message");
    if (message._id) {
        wrapper.dataset.id = message._id;
    }

    if (message.user === myId) {
        wrapper.classList.add("my");
    }

    const info = document.createElement("div");
    info.classList.add("msgInfo");

    const author = document.createElement("span");
    author.classList.add("msgAuthor");
    author.textContent = message.username;

    const time = document.createElement("span");
    time.textContent = message.createdAt ? formatTime(message.createdAt) : "";

    info.appendChild(author);
    info.appendChild(time);

    const box = document.createElement("div");
    box.classList.add("singleMsgBox");

    const actions = document.createElement("div");
    actions.classList.add("msgActions");

    const react = document.createElement("span");
    react.classList.add("material-symbols-outlined");
    react.classList.add("likeBtn");
    react.textContent = "add_reaction";

    const share = document.createElement("span");
    share.classList.add("material-symbols-outlined");
    share.textContent = "ios_share";
    share.classList.add("replyBtn")

    actions.appendChild(react);
    actions.appendChild(share);

    const text = document.createElement("div");
    text.classList.add("msgText");
    text.textContent = message.text;

    box.appendChild(actions);
    box.appendChild(text);

    const reactionsBox = document.createElement("div");
    reactionsBox.classList.add("reactionsBox");

    const reactions = document.createElement("div");
    reactions.classList.add("reactions");
    console.log(message.likes);

    if (message.likes?.length > 0) {
        reactions.textContent = `👍 ${message.likes.length}`;

    } else {
        reactionsBox.classList.add("hidden")
    }

    reactionsBox.appendChild(reactions)

    wrapper.appendChild(info);
    wrapper.appendChild(box);
    wrapper.appendChild(reactionsBox);
    return wrapper;
}
function renderMessage(message) {
    chatMessages.appendChild(createMessage(message));
}
function prependMessage(message) {
    chatMessages.prepend(createMessage(message));
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
        rooms = await fetch("/rooms/api").then(res => res.json());

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
            time.textContent = room.updatedAt ? formatTime(room.updatedAt) : "12:50";

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
    users = await fetch("/rooms/api/users")
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
    userSearchInput.placeholder = "Wyszukaj użytkownika";
} else {
    usersDiv.style.display = "none";
    userSearchInput.disabled = true;
    userSearchInput.placeholder = "Dostępny dla wszystkich";
}
roomType.onchange = () => {
    if (roomType.value === "private") {
        usersDiv.style.display = "block";
        userSearchInput.disabled = false;
        userSearchInput.placeholder = "Wyszukaj użytkownika";
    } else {
        usersDiv.style.display = "none";
        userSearchInput.disabled = true;
        userSearchInput.placeholder = "Dostępny dla wszystkich";
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
    closeOtherModals(createRoomModal);
    modalBox.style.display = "flex";
})
modalBox.addEventListener("click", (e) => {
    if (!e.target.closest(".modal")) {
        modalBox.style.display = "none";
    } else if (e.target.classList.contains("closeModal")) {
        modalBox.style.display = "none";
    }
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
chatInfoShowBtn.addEventListener("click", () => {
    if (rightSidebar.style.display === 'none') {
        rightSidebar.style.display = 'flex';
        if (window.innerWidth < 1200) {
            leftSidebar.style.display = 'none';
            if (window.innerWidth < 800) {
                main.style.display = 'none';

            }
        }
    } else {
        rightSidebar.style.display = 'none';
        leftSidebar.style.display = 'flex';
        main.style.display = 'flex';

    }
})
function closeOtherModals(open) {
    for (let el of modal.children) {
        if (el === open) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");

        }
    }
}
chatMessages.addEventListener("click", (e) => {
    if (e.target.classList.contains("replyBtn")) {
        const messageId = e.target.closest(".message").dataset.id;
        if (messageId) {
            closeOtherModals(replyMessageModal);
            modalBox.style.display = "flex";
            actReplyId = messageId;
        }
    } else if (e.target.classList.contains("likeBtn")) {
        console.log("Klik!");

        const messageId = e.target.closest(".message").dataset.id;
        if (messageId) {
            console.log(messageId);

            socket.emit("like", messageId)
        }
    }
})
function roomsListCreate() {
    rooms.forEach(room => {
        if (room._id != roomId) {
            const label = document.createElement("label");
            label.dataset.id = room._id;
            const span = document.createElement("span");
            span.textContent = room.name;

            label.append(span);
            modalRoomsList.append(label);
        }
    })
}
modalRoomsList.addEventListener("click", (e) => {
    const label = e.target.closest("#modalRoomsList label");
    if (label) {
        if (actReplyId && label.dataset.id) {
            socket.emit("reply", { msgId: actReplyId, roomId: label.dataset.id })
            modalBox.style.display = "none";
        }
    }
})
roomToReplySearchInput.addEventListener("input", (e) => {
    roomSearch(roomToReplySearchInput, modalRoomsList, "span");
})
openSettingsBtn.addEventListener("click", (e) => {
    closeOtherModals(chatSettingsModal);
    modalBox.style.display = "flex";
})
deleteRoomBtn.addEventListener("click", (e) => {
    console.log(roomId);

    socket.emit("deleteRoom", roomId);
})
socket.on("roomDeleted", () => {
    alert("Usunięto czat");
    window.location.href = "/chat";
})
function selectTheme(code) {
    const name = themeMap[code - 1] || "light";
    setTheme(themes[name]);
}
function setTheme(theme) {
    const [bg, ac, bgM, t1, t2] = theme;

    root.style.setProperty('--theme-bg', bg);
    root.style.setProperty('--theme-accent', ac);
    root.style.setProperty('--theme-bg-msg', bgM);
    root.style.setProperty('--theme-text', t1);
    root.style.setProperty('--theme-text-secondary', t2);
}

themeInputBox.addEventListener("change", (e) => {
    if (e.target.name != "theme") return;
    const selectedTheme = Number(e.target.value)
    activeTheme = selectedTheme;
    selectTheme(selectedTheme);
})
socket.on("roomUpdate", (r) => {
    roomData = r;
    console.dir(roomData);

    roomName.textContent = roomData.name;
    roomName2.textContent = roomData.name;
    changeChatName.value = roomData.name;
    const li = document.querySelector(
        `.el[data-id="${roomData._id}"]`
    );
    li.querySelector(".chatName").textContent = roomData.name;

    if (roomData.theme) {
        selectTheme(roomData.theme);
    }
})
socket.on("roomsListUpdated", (r) => {
    updateRoom(r);
})
saveRoomSettingsBtn.addEventListener("click", (e) => {
    if (roomData.owner != myId && roomData.members.findIndex(el => el.user === myId && el.role === "admin") === -1) {
        alert("Brak uprawnień");
    } else {
        const data = {}
        if (changeChatName.value != roomData.name) {
            data.name = changeChatName.value;
        }
        if (activeTheme != roomData.theme) {
            data.theme = activeTheme;
        }
        console.log(data);

        if (Object.keys(data).length > 0) {
            socket.emit("changeSettings", { roomId, data });
            modalBox.style.display = "none";
        }
    }
})
function formatTime(date) {
    const d = new Date(date);

    return d.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit"
    });
}
function updateRoom(room) {

    const li = document.querySelector(
        `.el[data-id="${room.roomId}"]`
    );

    if (!li) return;

    li.querySelector(".lastMessage").textContent = room.lastMessage;

    li.querySelector(".time").textContent = room.updatedAt ? formatTime(room.updatedAt) : "12:50";

    li.parentElement.prepend(li);
}
socket.on("msgReaction", ({ messageId, likes }) => {
    console.log(messageId, likes)
    updateLikes(messageId, likes);
})
function updateLikes(messageId, likes) {
    const reactionsBox = document.querySelector(`.message[data-id="${messageId}"] .reactionsBox`);
    if (!reactionsBox) return;
    const reactions = reactionsBox.querySelector(".reactions");
    const count = Array.isArray(likes) ? likes.length : likes;

    if (!count || count === 0) {
        reactionsBox.classList.add("hidden");
    } else {
        if (reactionsBox.classList.contains("hidden")) {
            reactionsBox.classList.remove("hidden");
        }
        reactions.textContent = `👍 ${likes.length}`;
    }
}
messageSearchInput.addEventListener("input", (e) => {
    roomSearch(messageSearchInput, chatMessages, ".msgText");
})
openMsgSearch.addEventListener("click", (e) => {
    if (msgSBox.classList.contains("hidden")) {
        msgSBox.classList.remove("hidden");
    } else {
        msgSBox.classList.add("hidden");
    }
})

openMembersBtn.addEventListener("click", (e) => {
    closeOtherModals(chatMembers);
    renderMembers();
    modalBox.style.display = "flex";
})
function renderMembers() {
    const members = roomData.members;
    membersList.innerHTML = "";
    members.forEach(member => {
        let role;
        switch (member.role) {
            case "admin":
                role = "Administrator"
                break;
            case "owner":
                role = "Właściciel"
                break;
            default:
                role = "Członek"
                break;
        }
        membersList.insertAdjacentHTML("afterbegin",
            ` <div class="member" data-id="${member.user._id}">
                        <div class="profilPicture">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div class="memberInfo">
                            <span class="memberName">${member.user.name}</span>
                            <span class="memberRole">${role}</span>
                        </div>
                        <div class="memberActions">
                            <span class="material-symbols-outlined more">
                                more_horiz
                            </span>
                            <div class="dropdown">
                                <div class="dropdownEl promote" ${member.role === "member" ? "" : 'style="display: none;"' }>
                                    <span>Awansuj</span>
                                    <span class="material-symbols-outlined">
                                        add_moderator
                                    </span>
                                </div>
                                <div class="dropdownEl demote" ${member.role === "admin" ? "" :'style="display: none;"' }>
                                    <span>Degraduj</span>
                                    <span class="material-symbols-outlined">
                                        remove_moderator
                                    </span>
                                </div>
                                <div class="dropdownEl remove" ${member.role != "owner" ? "" :'style="display: none;"' }>
                                    <span>Usuń</span>
                                    <span class="material-symbols-outlined">
                                        person_remove
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>`

        );
    })
}
membersList.addEventListener("click", (e) => {
    const dropdownEl = e.target.closest(".dropdownEl");
    if (dropdownEl) {
        const id = dropdownEl.closest(".member").dataset.id;
        console.log(id);

        if (dropdownEl.classList.contains("remove")) {
            socket.emit("removeMember", { roomId, memberId: id });
        } else if (dropdownEl.classList.contains("promote")) {
            socket.emit("promoteMember", { roomId, memberId: id });

            console.log("Awansuj", id);

        } else if (dropdownEl.classList.contains("demote")) {
            socket.emit("demoteMember", { roomId, memberId: id });

            console.log("Degraduj", id);

        }
    }
})
socket.on("membersUpdated", (members) => {
    if (members) {
        roomData.members = members;
        renderMembers();
    }
})
socket.on("removedFromRoom", ({ id }) => {
    removeRoomFromList(id)
    if (id.toString() !== roomId.toString()) return;
    alert("Zostałeś usunięty z tego czatu.");
    window.location.href = "/chat";

});
socket.on("addedToRoom", ({ room }) => {
    rooms.push(room);
    addRoomToList(room);
});
addMemberBtn.addEventListener("click", (e) => {
    closeOtherModals(addMembersModal);
    createMembersList();
})
function createMembersList() {

    membersToAddList.innerHTML = "";

    users.forEach(user => {

        const exists = roomData.members.some(
            member => member.user._id === user._id
        );

        if (exists) return;

        const label = document.createElement("label");

        label.innerHTML = `
            <input type="checkbox" value="${user._id}">
            <span>${user.name}</span>
        `;

        membersToAddList.append(label);

    });

}
memberSearchInput.addEventListener("input", (e) => {
    roomSearch(memberSearchInput, membersToAddList, "span");
});
addMembersSendBtn.addEventListener("click", (e) => {
    const members = [
        ...membersToAddList.querySelectorAll("input:checked")
    ].map(el => el.value);

    if (!members.length)
        return;

    socket.emit("addMembers", {
        roomId,
        members
    });

    modalBox.style.display = "none";
});
function addRoomToList(room) {
    const li = document.createElement("li");
    li.className = "el";
    li.dataset.id = room._id;

    const icon = document.createElement("div");
    icon.className = "icon";
    const iconSpan = document.createElement("span");
    iconSpan.classList.add("material-symbols-outlined");
    iconSpan.textContent = room.type === "private" ? "face" : "group";
    icon.appendChild(iconSpan);

    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "chatName";
    name.textContent = room.name;
    const last = document.createElement("div");
    last.className = "lastMessage";
    last.textContent = room.lastMessage || "Nowy pokój";
    info.append(name, last);

    const time = document.createElement("div");
    time.className = "time";
    time.textContent = room.updatedAt ? formatTime(room.updatedAt) : "12:50";

    li.append(icon, info, time);

    if (room.type === 'public') {
        chatListPublic.appendChild(li);
    } else {
        chatListPrivate.appendChild(li);
    }
    li.addEventListener("click", () => {
        window.location.href = "/chat?room=" + room._id;
    });
}
function removeRoomFromList(id) {
    const room = document.querySelector(`.chatList li.el[data-id="${id}"]`);
    room.remove();
}
chatMessages.addEventListener("scroll", () => {

    if (loadingMessages) return;
    if (!hasMoreMessages) return;

    if (chatMessages.scrollTop <= 50) {

        loadingMessages = true;

        socket.emit("loadOlderMessages", {
            roomId,
            before: oldestMessageDate
        });

    }

});
socket.on("olderMessages", messages => {


    loadingMessages = false;

    if (!messages.length) {
        hasMoreMessages = false;
        return;
    }

    oldestMessageDate = messages[messages.length - 1].createdAt;

    messages.forEach(prependMessage);


    const previousHeight = chatMessages.scrollHeight;


    const newHeight = chatMessages.scrollHeight;

    chatMessages.scrollTop += newHeight - previousHeight;

});