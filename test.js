function startLoader() {
  let counterElement = document.querySelector(".count p");
  let currentValue = 0;

  function updateCounter() {
    if (currentValue < 100) {
      let increment = Math.floor(Math.random() * 10) + 1;
      currentValue = Math.min(currentValue + increment, 100);
      counterElement.textContent = currentValue;

      let delay = Math.floor(Math.random() * 200) + 25;
      setTimeout(updateCounter, delay);
    }
  }

  updateCounter();
}

startLoader();

// Fade out counter after 3.5 seconds
gsap.to(".count", { opacity: 0, delay: 3.5, duration: 0.5 });

// Animate text
let textWrapper = document.querySelector(".ml16");
if (textWrapper) {
  textWrapper.innerHTML = textWrapper.textContent.replace(
    /\s/g,
    '<span class="letter">$&</span>'
  );
}

anime
  .timeline({ loop: false })
  .add({
    targets: ".ml16",
    translateY: [-100, 0],
    duration: 1500,
    easing: "easeOutExpo",
    delay: (el, i) => 30 * i,
  })
  .add({
    targets: ".ml16",
    translateY: [0, 300],
    easing: "easeOutExpo",
    duration: 7000,
    opacity:0,
    delay: (el, i) => 2000 + 30 * i,
  });

gsap.to(".pre-loader", {
  scale: 0.5,
  ease: "power4.intOut",
  duration: 2,
  delay: 3,
});
gsap.to(".loader", {
  height: "0",
  ease: "power4.intOut",
  duration: 1.5,
  delay: 3.7,
});

gsap.to(".loader-bg", {
  height: "0",
  ease: "power4.intOut",
  duration: 1.5,
  delay: 4,
});

gsap.to(".loader-2", {
  clipPath: "polygon(0% 0% ,100% 0%,100% 0%,0% 0%)",
  ease: "power4.intOut",
  duration: 1.5,
  delay: 3.5,
});
gsap.from(".header h1", {
  y: 200,
  ease: "power4.intOut",
  duration: 1.5,
  delay: 3.45,
  stagger: 0.05,
});

gsap.to(".img", {
  // clipPath: "polygon(0% 0% ,100% 0%,100% 100%,100% 0%)",
  ease: "power4.intOut",
  duration: 1.5,
  delay: 4.5,
  stagger: 0.25,
});
