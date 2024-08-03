let lastKnownScrollPosition = 0;
let ticking = false;

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

async function onKeySubmit(){
  console.log("Button clicked")
  const passwordElement = document.getElementById("key-start")
  const key = passwordElement.value
  const location = window.location.hostname;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
	body: JSON.stringify({password: key})
    };
    try {
        const fetchResponse = await fetch(`http://${location}:8080/check`, settings);
        const data = await fetchResponse.json();
	console.log(data)
   return data;
    } catch (e) {
        return e;
    }
}

const socket = io(window.location.host)

socket.on("connect", () => {
  console.log("connected")
})

socket.on("giveaway",name => {
  console.log(name)
})

// socket.emit("broadcast","test")

AOS.init()
