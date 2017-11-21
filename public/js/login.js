"use strict";
const socket = io();
socket.on('updateRoomList', updateRoomList);
document.addEventListener("DOMContentLoaded", () => {
	restoreProfile();
	let modal = document.getElementById('modal');
	let addRoom = document.getElementById('add-room');
	let avatars_btn = document.getElementById('avatars_button');
	let avatar_chosen = document.getElementById('avatar_chosen');
	window.onclick = function (event) {
		if (event.target !== addRoom) {
			document.getElementById('room_choice').classList.remove('visible');
		}
		if (event.target !== avatars_btn && event.target.parentNode !== avatars_btn
			&& event.target !== avatar_chosen) {
			document.getElementById("avatars").classList.remove('visible');
		}
	};
	avatars_btn.addEventListener("click", avatar_handler);
	addRoom.addEventListener("click", () => {
		document.getElementById('room_choice').classList.toggle('visible');
	});
	document.getElementById('public_room').addEventListener("click", () => {
		document.getElementById('modal').classList.add('visible');
		document.getElementById('room_choice').classList.remove('visible');
		document.getElementById('create').setAttribute('data-type', 'public');
	});
	document.getElementById('private_room').addEventListener("click", () => {
		document.getElementById('modal').classList.add('visible');
		document.getElementById('room_choice').classList.remove('visible');
		document.getElementById('create').setAttribute('data-type', 'private');
	});
	document.getElementById('create').addEventListener("click", (event) => {
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
	});
	document.getElementById('close_modal').addEventListener("click", () => {
		modal.classList.remove('visible');
	});
	modal.addEventListener("click", (event) => {
		if (event.target !== modal)return;
		document.getElementById('modal').classList.remove('visible');
	});
	addListenerToClass('rooms__item', (event) => {
		Array.from(document.getElementsByClassName('rooms__item')).forEach(elem => {
			elem.classList.remove('selected');
		});
		event.target.classList.add('selected');
	});
	document.forms[0].onsubmit = function () {
		let nickname = document.getElementById('nickname').value;
		localStorage.setItem('name', nickname?nickname.substring(0,20):'');
		localStorage.setItem('avatar', avatar_chosen.src);
	};

});

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
	document.getElementById('avatars_button').style['display'] = 'none';
}
function addListenerToClass(className, callback) {
	let elems = document.getElementsByClassName(className);
	Array.from(elems).forEach(function (element) {
		element.addEventListener('click', callback);
	});
}
function restoreProfile() {
	document.getElementById("avatar_chosen").addEventListener("click", avatar_handler);

	document.getElementById('nickname').value = localStorage.getItem('name');
	let avatar = localStorage.getItem('avatar');
	if (avatar) {
		document.getElementById('avatar_chosen').src = avatar;
		document.getElementById('avatars_button').style['display'] = 'none';
	}
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
                        <span class="enter_room">
                        <i class="fa fa-sign-in" aria-hidden="true" title="Enter"></i>
                        </span>`;
		rooms_wrapper.appendChild(room);
	}
	addListenerToClass('rooms__item', (event) => {
		let img = document.getElementById('avatar_chosen').src;
		let nickname = document.getElementById('nickname').value;
		localStorage.setItem('name', nickname?nickname.substring(0,20):'');
		localStorage.setItem('avatar', img ? img : '');
		let rooms__item = (() => {
			let parent = event.target;
			while (parent && parent !== document) {
				if (parent.matches('.rooms__item'))return parent;
				parent = parent.parentNode;
			}
		})();
		if (!rooms__item)return;
		location.href = `/rooms/${rooms__item.id}`;
	});
}