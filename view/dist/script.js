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

function onKeySubmit(){
  console.log("Button clicked")
  const passwordElement = document.getElementById("key-start")
  const key = passwordElement.value
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
