(function () {
	const notif_audio = new Audio('../js/notif.mp3');
	let msg_wrapper = document.querySelector('.messages-wrapper');
	let lastMsg;
	let socket
	init()
	function toggleAudioNotification(target) {
		target.classList.toggle('off');
		let play_notif = localStorage.getItem('play_notif');
		localStorage.setItem('play_notif',play_notif==="false");
	}
	function sendMsg() {
		let input = document.getElementById('msg');
		let message = input && input.value;
		if (!message || !message.trim())return;
		printMsg({name:localStorage.getItem('name'), avatar:localStorage.getItem('avatar'), message, date: Date.now()});
		socket.emit('chat', message);
		input.value = '';
	}
	function nl2br(str) {
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
	}
	function getFormattedDate(timestamp) {
		if (!timestamp) return "long ago"
		let timeStampDiff = Date.now() - timestamp;
		switch (true) {
			case (timeStampDiff / (24 * 60 * 60 * 1000)) > 1:
				return Math.ceil(timeStampDiff / (24 * 60 * 60 * 1000)) + " days ago";
				break;
			default :
				return (new Date(timestamp)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
				break;
		}
	}
	function printMsg(msg, play_sound = true) {
		let div = document.createElement('div');
		let {isCurrent, isAuthorSame}=checkMsgMeta(msg);
		let isSameMsgClass = isAuthorSame ? ' same' : "";
		let isCurrentUserClass = isCurrent ? ' current' : "";
		let formattedDate = getFormattedDate(msg.date);
		div.className = "message" + isSameMsgClass + isCurrentUserClass;
		div.innerHTML = `<div class="message__image">
                        <img src="${msg.avatar}"
                             alt="">
                    </div>
                    <div class="message__text">
						<span class="name">
							${msg.name}
						</span>
                        <p>${nl2br(msg.message)}</p>
                    </div>
					<div class="message__time">${formattedDate}</div>`;
		msg_wrapper.appendChild(div);
		twemoji.parse(msg_wrapper);

		div.scrollIntoView();
		lastMsg = msg;
		let play_notif = localStorage.getItem('play_notif') !== null ? localStorage.getItem('play_notif') : true;
		if (isCurrent || play_notif==='false' || !play_sound) {
			return
		}
		notif_audio.play();
	}
	function checkMsgMeta(msg) {
		const isCurrent = (msg.avatar === localStorage.getItem('avatar') && msg.name === localStorage.getItem('name'));
		const isAuthorSame = lastMsg && (msg.avatar === lastMsg.avatar && msg.name === lastMsg.name);
		return {isCurrent, isAuthorSame}
	}
	function infoMessage(text) {
		let p = document.createElement('p');
		p.className = 'info-message';
		p.innerText = text;
		msg_wrapper.appendChild(p);
		p.scrollIntoView();
	}
	function onElementHeightChange(elm, callback) {
		let lastHeight = elm.clientHeight, newHeight;
		(function run() {
			newHeight = elm.clientHeight;
			if (lastHeight !== newHeight)
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
			visitor.setAttribute('data-name', user.name);
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
		if (!target.classList.contains('emoji')) {
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
	function roomInfo(room) {
		msg_wrapper.innerHTML=""
		for (let msg of room.history) {
			printMsg(msg, false);
		}
		infoMessage(`Welcome to the chat ${localStorage.getItem('name')}`);
		document.getElementById('roomName').innerHTML = room.roomName;
		fetch('https://api.chucknorris.io/jokes/random')
			.then((response) => response.json())
			.then(function (json) {
				if (json && json.value) {
					infoMessage(`(Interesting fact: ${json.value})`);
				}
			})
			.catch(console.error);
	}
	function handleInviteClick() {
		var icon = document.querySelector('.tooltip');
		icon.addEventListener('click', function (event) {
			// Select the email link anchor text
			var link = document.getElementById('tooltiptext');
			var range = document.createRange();
			range.selectNode(link);
			window.getSelection().addRange(range);

			try {
				// Now that we've selected the anchor text, execute the copy command
				document.execCommand('copy');
				alert("Link to chat was copied to your clipboard")
			} catch (err) {
				alert("Sorry.Link to chat wasn't copied to your clipboard. Try to select yourself")
			}

			// Remove the selections - NOTE: Should use
			// removeRange(range) when it is supported
			window.getSelection().removeAllRanges();
		});
	}
	function initState() {
		let name = localStorage.getItem('name');
		if (!name) {
			name = 'unknown';
			localStorage.setItem('name', name)
		}
		let avatar = localStorage.getItem('avatar');
		if (!avatar) {
			avatar = '../img/Anonimo.jpg';
			const a = document.createElement('a')
			a.href=avatar
			localStorage.setItem('avatar', a.href)
		}
		let room = location.pathname.split('/rooms/')[1];
		document.getElementById('tooltiptext').innerHTML = location.href;
		if(localStorage.getItem('play_notif')==='false'){
			document.querySelector('.volume').classList.add('off');
		}
		socket = io({query: {name, room, avatar}});
	}
	function initListeners() {
		document.addEventListener("DOMContentLoaded", () => {
			initState()
			handleInviteClick();
			onElementHeightChange(msg_wrapper, setScroll);
			onElementHeightChange(document.querySelector('.visitors'), setScroll);
			onElementHeightChange(document.body, setScroll);
			document.forms[0].onsubmit = sendMsg;
			document.querySelector('body').addEventListener('click', function (ev) {
				const target = ev.target
				if (!target)return;
				switch (true) {
					case isElemClicked(target, 'emojis'):
						document.getElementById('emojis__container').classList.toggle('visible');
						loadEmojis();
						break;
					case isElemClicked(target, 'emojis__item'):
						insertEmoji(target);
						break;
					case isElemClicked(target, 'send'):
						sendMsg();
						break;
					case isElemClicked(target, 'volume'):
						toggleAudioNotification(target);
						break;
					case isElemClicked(target, 'hamburger'):
						document.getElementById('hamburger').classList.toggle('open')
						document.getElementById('sidebar').classList.toggle('open')
						break;
					default:
						document.getElementById('emojis__container').classList.remove('visible');
						break;
				}
			})
			document.getElementById('msg').addEventListener('keydown', function (ev) {
				if(ev.ctrlKey && ev.keyCode===13){
					ev.preventDefault();
					ev.target.value+='\n';
				}else if(ev.keyCode===13){
					ev.preventDefault();
					sendMsg()
				}
			})
			socket.on('infoMessage', infoMessage);
			socket.on('message', printMsg);
			socket.on('updateUserList', loadVisitors);
			socket.on('roomInfo', roomInfo);
		});
	}
	function init() {
		initListeners()
	}
})()