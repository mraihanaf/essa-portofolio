let lastKnownScrollPosition = 0;
let ticking = false;
let keyMain = ""
let users = []

const defaults = {
	spread: 360,
	ticks: 100,
	gravity: 0,
	decay: 0.94,
	startVelocity: 30,
  };
  
  function shoot() {
	confetti({
	  ...defaults,
	  particleCount: 30,
	  scalar: 1.2,
	  shapes: ["circle", "square"],
	  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
	});
  
	confetti({
	  ...defaults,
	  particleCount: 20,
	  scalar: 2,
	  shapes: ["emoji"],
	  shapeOptions: {
		emoji: {
		  value: ["🦄", "🌈"],
		},
	  },
	});
  }

function party(){
	const duration = 3 * 1000,
  animationEnd = Date.now() + duration,
  defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const interval = setInterval(function() {
  const timeLeft = animationEnd - Date.now();

  if (timeLeft <= 0) {
    return clearInterval(interval);
  }

  const particleCount = 50 * (timeLeft / duration);

  // since particles fall down, start a bit higher than random
  confetti(
    Object.assign({}, defaults, {
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
  );
  confetti(
    Object.assign({}, defaults, {
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  );
}, 250);
}

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
	const msg_or = heading.cloneNode(true)
	msg_or.textContent = "Atau buka link bit.ly/yotgiveaway"
	msg_el.textContent = "Chat saya +62 812 3898 1143 Untuk Ikut. Dengan Pesan :"
	sections.append(msg_el)
	
	const msgP_el = heading.cloneNode(true)
	
	msgP_el.textContent = "[nama kalian] juga mw"
	sections.append(msgP_el)
	sections.append(msg_or)
	const notif = heading.cloneNode(true)
	notif.textContent = ""
	sections.append(notif)
	socket.on("giveaway", (nama) => {
		notif.textContent = `${nama} Ikut giveaway🤩`
		users.push(nama)
		heading.textContent = `Giveaway🎉 (${users.length} orang ikut)`
		shoot()
	})
	submitRandom.textContent = "Mulai Giveaway"
	sections.append(submitRandom)
	submitRandom.onclick = () => {
		party()
		console.log(key)
		socket.emit("broadcast",keyMain)
		console.log("clickedx")		// click event
		msg_or.remove()
		heading.textContent = "3 Pemenang Giveaway🎉"
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

