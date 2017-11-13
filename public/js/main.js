let name = localStorage.getItem('name') || 'unknown';
let avatar = localStorage.getItem('avatar') || '/img/Anonimo.jpg';
let room = location.pathname.split('/rooms/')[1];
let msg_wrapper = document.querySelector('.messages-wrapper');

if (!room) {
	// location.href = '/';
}
const socket = io({query: {name, room, avatar}});
socket.on('infoMessage', infoMessage);
socket.on('message', printMsg);
socket.on('updateUserList', loadVisitors);
socket.on('updateMsgHistory', updateMsgHistory);
document.addEventListener("DOMContentLoaded", () => {
	let visitors = document.querySelector('.visitors');
	let message_wrapper = document.querySelector('.messages-wrapper');
	document.getElementById('tooltiptext').innerHTML=location.href;
	onElementHeightChange(message_wrapper, setScroll);
	onElementHeightChange(visitors, setScroll);
	onElementHeightChange(document.body, setScroll);
	document.forms[0].onsubmit = sendMsg;
	document.querySelector('body').addEventListener('click', function (ev) {
		if (!ev || !ev.target)return;
		switch (true) {
			case isElemClicked(ev.target, 'emojis'):
				document.getElementById('emojis__container').classList.toggle('visible');
				loadEmojis();
				break;
			case isElemClicked(ev.target, 'emojis__item'):
				insertEmoji(ev.target);
				break;
			case isElemClicked(ev.target,'send'):
				sendMsg();
				break;
			default:
				document.getElementById('emojis__container').classList.remove('visible');
				break;
		}
	})
});

function sendMsg() {
	let input = document.getElementById('msg');
	let message = input && input.value;
	if (!message || !message.trim())return;
	printMsg({name, avatar, message});
	socket.emit('chat', message);
	input.value = '';
}
function printMsg(msg) {
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
	twemoji.parse(msg_wrapper);

	div.scrollIntoView();
}
function infoMessage(text) {
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
	if (message_wrapper.offsetHeight - 5 > (sidebar.offsetHeight - sidebar_header.offsetHeight)) {
		message_wrapper.style['overflow-y'] = 'scroll';
	}
}
function isElemClicked(elem, name) {
	const id = elem.id;
	const classList = elem.classList;
	const parentId = elem.parentNode.id;
	const parentClasslist = elem.parentNode.classList;
	return id === name || parentId === name || classList.contains(name) || parentClasslist.contains(name);

}
function loadVisitors(list) {
	if (!list)return;
	let visitors = document.querySelector('#visitors');
	visitors.innerHTML = '';
	for (let user of list) {
		let visitor = document.createElement('div');
		visitor.className = 'visitor';
		visitor.setAttribute('data-name',user.name);
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
function loadEmojis() {
	const container = document.getElementById('emojis__container');
	if (container.childElementCount)return;
	for (let i = 0; i < 5; i++) {
		for (let k = 0; k < 15; k++) {
			let part = k < 10 ? i.toString() + k : i.toString() + k.toString(16);
			let span = document.createElement('span');
			let symbol = `&#x1F6${part};`;
			span.className = 'emojis__item';
			span.setAttribute('data-code', symbol);
			span.innerHTML = symbol;
			container.appendChild(span);
		}
	}
	twemoji.parse(container);
}
function insertEmoji(target) {
	if(!target.classList.contains('emoji')){
		target = target.children[0];
	}
	document.getElementById('emojis__container').classList.remove('visible');
	insertToInput(target['alt']);
}
function insertToInput(value) {
	const msg = document.getElementById('msg');
	msg.value += value;
	msg.focus();
}
function updateMsgHistory(history) {
	for(let msg of history){
		printMsg(msg);
	}
	infoMessage(`Welcome to the chat ${name}`);

	fetch('https://api.chucknorris.io/jokes/random')
		.then((response)=> response.json())
		.then(function (json) {
			if (json && json.value) {
				infoMessage(`(Interesting fact: ${json.value})`);
			}
		})
		.catch(console.error);
}