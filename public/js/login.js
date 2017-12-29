"use strict";
const socket = io();
socket.on('updateRoomList', updateRoomList);
document.addEventListener("DOMContentLoaded", () => {
	restoreProfile();
	let modal = document.getElementById('modal');
	let avatar_chosen = document.getElementById('avatar_chosen');
	document.addEventListener('click',function (ev) {
		const target =ev.target;
		const id =target.id;
		if (id !== 'add-room'&&!target.classList.contains('new-room__add')) {
			document.getElementById('room_choice').classList.remove('visible');
		}
		if (id !== 'avatar_chosen') {
			document.getElementById("avatars").classList.remove('visible');
		}
		switch (true){
			case id==='add-room':
				document.getElementById('room_choice').classList.toggle('visible');
				break
			case id==='public_room':
				modal.classList.add('visible');
				document.getElementById('room_choice').classList.remove('visible');
				document.getElementById('create').setAttribute('data-type', 'public');
				break
			case id==='private_room':
				modal.classList.add('visible');
				document.getElementById('room_choice').classList.remove('visible');
				document.getElementById('create').setAttribute('data-type', 'private');
				break
			case id==='create':
				createRoom(ev)
				break
			case id==='modal':
				modal.classList.remove('visible');
				break
			case id==='close_modal':
				modal.classList.remove('visible');
				break
			case id==='avatar_chosen':
				avatar_handler()
				break
			case target.classList.contains('rooms__item'):
				Array.from(document.getElementsByClassName('rooms__item')).forEach(elem => {
					elem.classList.remove('selected');
				});
				let img = document.getElementById('avatar_chosen').src;
				let nickname = document.getElementById('nickname').value;
				localStorage.setItem('name', nickname ? nickname.substring(0, 24) : '');
				localStorage.setItem('avatar', img ? img : '');
				location.href = `./rooms/${id}`;
				target.classList.add('selected');
				break
			case target.classList.contains('modal__window'):
			case target.tagName=="HTML":
				break
			default:
				target.parentNode.click();
		}
	})

	document.forms[0].onsubmit = function () {
		let nickname = document.getElementById('nickname').value;
		localStorage.setItem('name', nickname ? nickname.substring(0, 20) : '');
		localStorage.setItem('avatar', avatar_chosen.src);
	};

});
function createRoom(event)  {
	let type = event.target.dataset.type;
	let room_name = document.getElementById('room_name').value;
	if (!type || !room_name)return;
	if (type === 'private') {
		socket.emit('createPrivateRoom', room_name, (id) => {
			location.href = "/rooms/" + id;
		})
	} else if (type === 'public') {
		socket.emit('createPublicRoom', room_name, () => {
			document.getElementById('modal').classList.remove('visible');
		})
	}
}
function avatar_handler() {
	let avatars = document.getElementById("avatars");
	if (avatars.childElementCount === 0) {
		for (let i = 1; i <= 20; i++) {
			let img = document.createElement('img');
			img.className = 'avatar_img';
			let sex = i % 2 ? 'male' : 'female';
			img.src = `https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/${sex}/${i}.png`;
			avatars.appendChild(img);
		}
		addListenerToClass('avatar_img', (event) => chooseAvatar(event.target.src, avatars));
	}
	avatars.classList.toggle('visible');
}
function chooseAvatar(src, avatars) {
	avatars.classList.toggle('visible');
	let chosen = document.getElementById("avatar_chosen");
	chosen.src = src;
	localStorage.setItem('avatar', chosen.src);
	chosen.removeEventListener("click", avatar_handler);
	chosen.addEventListener("click", avatar_handler);
}
function addListenerToClass(className, callback) {
	let elems = document.getElementsByClassName(className);
	Array.from(elems).forEach(function (element) {
		element.addEventListener('click', callback);
	});
}
function restoreProfile() {
	document.getElementById('nickname').value = localStorage.getItem('name');
	const anonimImage = '../img/Anonimo.jpg';
	const a = document.createElement('a')
	a.href = anonimImage
	document.getElementById('avatar_chosen').src = localStorage.getItem('avatar') || a.href;
}
function updateRoomList(list) {
	let rooms_wrapper = document.getElementById('rooms');
	rooms_wrapper.innerHTML = '';
	for (let i = 0; i < list.length; i++) {
		let room = document.createElement('div');
		room.className = 'rooms__item';
		room.id = list[i].id;
		room.innerHTML = `<span class="rooms__number"> ${i + 1}.</span>
                        ${list[i].name}
                        <span class="round-button">
                        Enter
                        </span>`;
		rooms_wrapper.appendChild(room);
	}
}