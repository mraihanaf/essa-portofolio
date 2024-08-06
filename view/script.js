let lastKnownScrollPosition = 0;
let ticking = false;
let keyMain = ""
let users = []
function sAD() {
	randIndex = Math.floor(Math.random() * users.length);
	randomItem = users.splice(randIndex, 1)[0];
	return randomItem
}
document.addEventListener("scroll", (event) => {
  lastKnownScrollPosition = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollToDiscover = document.getElementById("scroll")
      if(lastKnownScrollPosition > 0){
        scrollToDiscover.classList.add("fade-out-animate")
      } else {
        scrollToDiscover.classList.remove("fade-out-animate")
      }
      ticking = false;
    });

    ticking = true;
  }
});
const socket = io(window.location.host)
async function onKeySubmit(){
  console.log("Button clicked")
  const passwordElement = document.getElementById("key-start")
  const key = passwordElement.value
  const location = window.location.origin;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
	body: JSON.stringify({password: key})
    };
    try {
        const fetchResponse = await fetch(`${location}/check`, settings);
	const keyTemp = await fetchResponse.text()
	console.log(fetchResponse.status)
	console.log(keyTemp)
	if(fetchResponse.status !== 200) return
	keyMain = keyTemp
	let heading = document.getElementById("special")
	heading.textContent = "Giveaway🎉"
	document.getElementById("key-start").remove()
	const btn = document.getElementById("button-special")
	const submitRandom = btn.cloneNode(true)
	btn.remove()
	const sections = document.getElementById("more")
	const msg_el = heading.cloneNode(true)
	msg_el.textContent = "Chat saya +62 812 3898 1143 Untuk Ikut. Dengan Pesan :"
	sections.append(msg_el)
	const msgP_el = heading.cloneNode(true)
	msgP_el.textContent = "ikut dong rai nama aku [nama kalian]"
	sections.append(msgP_el)
	const notif = heading.cloneNode(true)
	notif.textContent = ""
	sections.append(notif)
	socket.on("giveaway", (nama) => {
		notif.textContent = `${nama} Ikut giveaway`
		users.push(nama)
		heading.textContent = `Giveaway🎉 (${users.length} orang ikut)`
	})
	submitRandom.textContent = "Mulai Giveaway"
	sections.append(submitRandom)
	submitRandom.onclick = () => {
		console.log(key)
		socket.emit("broadcast",keyMain)
		console.log("clickedx")		// click event
		notif.textContent = sAD()
		msg_el.textContent = sAD()
		msgP_el.textContent = sAD()
	}
    } catch (e) {
        console.error(e)
    }
}

socket.on("connect", () => {
  console.log("connected")
})

socket.on("giveaway",name => {
  console.log(name)
})

// socket.emit("broadcast","test")

AOS.init()

