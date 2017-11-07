let name = localStorage.getItem('name') || 'unknown';
let avatar = localStorage.getItem('avatar') || 'https://upload.wikimedia.org/wikipedia/commons/8/88/An%C3%B3nimo.jpg';
let room = location.pathname.split('/rooms/')[1];
if (!room) {
	location.href = '/';
}
const socket = io({query: {name, room, avatar}});
socket.on('infoMessage', infoMessage);
socket.on('connect', () => infoMessage(`Welcome to the chat ${name}`));
socket.on('message', printMsg);
socket.on('updateUserList', loadVisitors);
document.addEventListener("DOMContentLoaded", () => {
	let visitors = document.querySelector('.visitors');
	let message_wrapper = document.querySelector('.messages-wrapper');
	setScroll();
	onElementHeightChange(message_wrapper, setScroll);
	onElementHeightChange(visitors, setScroll);
	onElementHeightChange(document.body, setScroll);
	document.forms[0].onsubmit = function () {
		let input = document.getElementById('msg');
		let message = input && input.value;
		if (!message || !message.trim())return;
		printMsg({name, avatar, message});
		socket.emit('chat', message);
		input.value = '';
	};
});
function printMsg(msg) {
	let msg_wrapper = document.querySelector('.messages-wrapper');
	let div = document.createElement('div');
	div.className = "message";
	div.innerHTML = `<div class="message__image">
                        <img src="${msg.avatar}"
                             alt="">
                    </div>
                    <div class="message__text">
						<span class="name">
							${msg.name}
						</span>
                        <p>${msg.message}</p>
                    </div>`;
	msg_wrapper.appendChild(div);
	div.scrollIntoView();
}
function infoMessage(text) {
	let msg_wrapper = document.querySelector('.messages-wrapper');
	let p = document.createElement('p');
	p.className = 'info-message';
	p.innerText = text;
	msg_wrapper.appendChild(p);
}
function onElementHeightChange(elm, callback) {
	let lastHeight = elm.clientHeight, newHeight;
	(function run() {
		newHeight = elm.clientHeight;
		if (lastHeight != newHeight)
			callback();
		lastHeight = newHeight;

		if (elm.onElementHeightChangeTimer)
			clearTimeout(elm.onElementHeightChangeTimer);

		elm.onElementHeightChangeTimer = setTimeout(run, 200);
	})();
}
function setScroll() {
	let sidebar_header = document.querySelector('.sidebar header');
	let sidebar = document.querySelector('.sidebar');
	let visitors = document.querySelector('.visitors');
	let message_wrapper = document.querySelector('.messages-wrapper');
	if (visitors.offsetHeight > (sidebar.offsetHeight - sidebar_header.offsetHeight)) {
		sidebar.style['overflow-y'] = 'scroll';
	} else {
		sidebar.style['overflow-y'] = 'initial';
	}
	if (message_wrapper.offsetHeight-5 > (sidebar.offsetHeight - sidebar_header.offsetHeight)) {
		message_wrapper.style['overflow-y'] = 'scroll';
	}
}
function loadVisitors(list) {
	if (!list)return;
	let visitors = document.querySelector('#visitors');
	visitors.innerHTML = '';
	for (let user of list) {
		let visitor = document.createElement('div');
		visitor.className = 'visitor';
		visitor.innerHTML = `<div class="visitor__image">
                        <img src="${user.avatar}"
                             alt="${user.name}">
                    </div>
                    <p class="visitor__name">
                        ${user.name}
                    </p>`;
		visitors.appendChild(visitor);
	}
}