/* ================================
   SOCKET
================================ */

const socket = io();

/* ================================
   ELEMENTS
================================ */

const stage =
    document.getElementById("stage");

const leafletMain =
    document.querySelector(".leaflet-main");

const leafletBg =
    document.querySelector(".leaflet-bg");

const participantName =
    document.getElementById("participantName");

const celebrationCanvas =
    document.getElementById("celebrationCanvas");

const sparkleCanvas =
    document.getElementById("sparkleCanvas");

const ctx =
    celebrationCanvas.getContext("2d");

const sparkleCtx =
    sparkleCanvas.getContext("2d");

/* ================================
   GALLERY (see assets/js/gallery.js)
================================ */

const GALLERY_IMAGES = window.GALLERY_IMAGES || [];

let currentImageIndex = 0;

let imageChangeInProgress = false;

/* ================================
   CANVAS SIZE
================================ */

function resizeCanvases() {

    celebrationCanvas.width =
        window.innerWidth;

    celebrationCanvas.height =
        window.innerHeight;

    sparkleCanvas.width =
        window.innerWidth;

    sparkleCanvas.height =
        window.innerHeight;
}

resizeCanvases();

window.addEventListener(
    "resize",
    resizeCanvases
);

/* ================================
   CONNECTION
================================ */

socket.on("connect", () => {

    console.log(
        "✅ Display connected:",
        socket.id
    );
});

socket.on("disconnect", () => {

    console.log(
        "❌ Display disconnected"
    );
});

/* ================================
   CURTAIN STATE
================================ */

socket.on(
    "curtain-state",

    (state) => {

        setCurtainState(
            state,
            false
        );
    }
);

socket.on(
    "open-curtain",

    () => {

        console.log(
            "🟢 OPEN command received"
        );

        setCurtainState(
            "open",
            true
        );
    }
);

socket.on(
    "close-curtain",

    () => {

        console.log(
            "🔴 CLOSE command received"
        );

        setCurtainState(
            "closed",
            false
        );
    }
);

function setCurtainState(
    state,
    withFanfare
) {

    if (
        stage.dataset.state === state
    ) {
        return;
    }

    stage.dataset.state = state;

    if (
        state === "open" &&
        withFanfare
    ) {

        stage.classList.add(
            "pulse-flash"
        );

        setTimeout(
            () => {

                stage.classList.remove(
                    "pulse-flash"
                );

            },
            1300
        );
    }

    if (
        state === "closed"
    ) {

        stopAllEffects();
    }
}

/* ================================
   SET POSTER + NAME
================================ */

function setLeafletImage(index) {

    const item =
        GALLERY_IMAGES[index];

    if (!item) {
        return;
    }

    const safeSrc =
        encodeURI(item.src);

    leafletMain.src =
        safeSrc;

    leafletBg.src =
        safeSrc;

    participantName.textContent =
        item.name;

    console.log(
        `🖼️ Image ${index + 1}: ${item.src} — ${item.name}`
    );
}

/* ================================
   IMAGE CHANGE
================================ */

const CURTAIN_TRANSITION_MS = 2200;

const SWAP_BUFFER_MS = 300;

const REOPEN_DELAY_MS = 400;

function goToImage(targetIndex) {

    if (
        imageChangeInProgress ||
        GALLERY_IMAGES.length === 0
    ) {
        return;
    }

    imageChangeInProgress = true;

    const nextIndex =
        (
            (
                targetIndex %
                GALLERY_IMAGES.length
            )
            +
            GALLERY_IMAGES.length
        )
        %
        GALLERY_IMAGES.length;

    const wasOpen =
        stage.dataset.state === "open";

    function swapThenReopen() {

        currentImageIndex =
            nextIndex;

        setLeafletImage(
            currentImageIndex
        );

        setTimeout(
            () => {

                setCurtainState(
                    "open",
                    true
                );

                imageChangeInProgress =
                    false;

            },
            REOPEN_DELAY_MS
        );
    }

    if (wasOpen) {

        setCurtainState(
            "closed",
            false
        );

        setTimeout(
            swapThenReopen,
            CURTAIN_TRANSITION_MS
            +
            SWAP_BUFFER_MS
        );

    } else {

        swapThenReopen();
    }
}

socket.on(
    "next-image",
    () => {

        goToImage(
            currentImageIndex + 1
        );
    }
);

socket.on(
    "prev-image",
    () => {

        goToImage(
            currentImageIndex - 1
        );
    }
);

socket.on(
    "show-image",
    (index) => {

        goToImage(
            Number(index)
        );
    }
);

setLeafletImage(
    currentImageIndex
);

/* ================================
   CELEBRATION SYSTEM
================================ */

socket.on(
    "celebrate",
    (effectType) => {

        console.log(
            "🎉 Effect received:",
            effectType
        );

        launchEffect(
            effectType
        );
    }
);

let particles = [];

let sparkles = [];

let celebrationRunning = false;

let animLoopActive = false;

let sparkleRunning = false;

let effectTimer = null;

let sparkleTimer = null;

let frameCount = 0;

const CONFETTI_COLORS = [
    "#ff1744",
    "#ffea00",
    "#00e676",
    "#2979ff",
    "#d500f9",
    "#ff9100",
    "#ffffff",
    "#ffd700"
];

const GOLD_COLORS = [
    "#ffd700",
    "#ffe9a8",
    "#fff1c1",
    "#d4af37",
    "#fff8dc"
];

function stopAllEffects() {

    celebrationRunning = false;

    sparkleRunning = false;

    animLoopActive = false;

    clearTimeout(effectTimer);

    clearTimeout(sparkleTimer);

    particles = [];

    sparkles = [];

    celebrationCanvas.style.display =
        "none";

    sparkleCanvas.style.display =
        "none";

    ctx.clearRect(
        0,
        0,
        celebrationCanvas.width,
        celebrationCanvas.height
    );

    sparkleCtx.clearRect(
        0,
        0,
        sparkleCanvas.width,
        sparkleCanvas.height
    );
}

function launchEffect(type) {

    clearTimeout(effectTimer);

    celebrationCanvas.style.display =
        "block";

    particles = [];

    switch (type) {

        case "confetti":

            confettiBlast();

            break;

        case "gold":

            goldShower();

            break;

        case "fireworks":

            fireworksShow();

            break;

        case "streamers":

            streamerDrop();

            break;

        default:

            confettiBlast();
    }

    startAmbientSparkles();

    celebrationRunning = true;

    if (!animLoopActive) {

        animLoopActive = true;

        animateParticles();
    }

    effectTimer = setTimeout(
        () => {

            celebrationRunning = false;

            celebrationCanvas.style.display =
                "none";

            particles = [];

        },
        8000
    );
}

/* ================================
   PARTY POPPER / CONFETTI
================================ */

function confettiBlast() {

    burstFrom(
        celebrationCanvas.width * .06,
        celebrationCanvas.height * .94,
        CONFETTI_COLORS
    );

    burstFrom(
        celebrationCanvas.width * .94,
        celebrationCanvas.height * .94,
        CONFETTI_COLORS
    );
}

function burstFrom(
    x,
    y,
    colors
) {

    for (
        let i = 0;
        i < 160;
        i++
    ) {

        const angle =
            -Math.PI / 2
            +
            (Math.random() - .5)
            *
            1.5;

        const speed =
            9
            +
            Math.random()
            *
            19;

        particles.push({

            x,
            y,

            vx:
                Math.cos(angle)
                *
                speed,

            vy:
                Math.sin(angle)
                *
                speed,

            gravity:
                .18
                +
                Math.random()
                *
                .18,

            drag: .987,

            size:
                5
                +
                Math.random()
                *
                11,

            rotation:
                Math.random()
                *
                Math.PI,

            rotationSpeed:
                (Math.random() - .5)
                *
                .4,

            color:
                colors[
                    Math.floor(
                        Math.random()
                        *
                        colors.length
                    )
                ],

            life: 1,

            decay: .0035,

            shape:
                Math.random() > .7
                    ?
                    "circle"
                    :
                    "rectangle"
        });
    }
}

/* ================================
   GOLD SHOWER
================================ */

function goldShower() {

    for (
        let i = 0;
        i < 140;
        i++
    ) {

        particles.push({

            x:
                Math.random()
                *
                celebrationCanvas.width,

            y:
                -20
                -
                Math.random()
                *
                celebrationCanvas.height
                *
                .5,

            vx:
                (Math.random() - .5)
                *
                .6,

            vy:
                1.5
                +
                Math.random()
                *
                2.5,

            gravity: .01,

            drag: 1,

            size:
                3
                +
                Math.random()
                *
                6,

            rotation:
                Math.random()
                *
                Math.PI,

            rotationSpeed:
                (Math.random() - .5)
                *
                .1,

            color:
                GOLD_COLORS[
                    Math.floor(
                        Math.random()
                        *
                        GOLD_COLORS.length
                    )
                ],

            life: 1,

            decay: .0012,

            shape: "circle",

            sway:
                1
                +
                Math.random()
                *
                1.5,

            swayFreq:
                .01
                +
                Math.random()
                *
                .02,

            swayPhase:
                Math.random()
                *
                Math.PI
                *
                2
        });
    }
}

/* ================================
   FIREWORKS
================================ */

function fireworksShow() {

    let launched = 0;

    const totalBursts = 6;

    function launchOne() {

        if (
            !celebrationRunning &&
            launched > 0
        ) {
            return;
        }

        const x =
            celebrationCanvas.width
            *
            (
                .2
                +
                Math.random()
                *
                .6
            );

        const y =
            celebrationCanvas.height
            *
            (
                .18
                +
                Math.random()
                *
                .35
            );

        burstFrom(
            x,
            y,
            CONFETTI_COLORS
        );

        launched++;

        if (
            launched < totalBursts
        ) {

            setTimeout(
                launchOne,
                500
                +
                Math.random()
                *
                500
            );
        }
    }

    launchOne();
}

/* ================================
   STREAMERS
================================ */

function streamerDrop() {

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        particles.push({

            x:
                Math.random()
                *
                celebrationCanvas.width,

            y:
                -30
                -
                Math.random()
                *
                celebrationCanvas.height
                *
                .5,

            vx: 0,

            vy:
                1.2
                +
                Math.random()
                *
                1.8,

            gravity: .01,

            drag: 1,

            size:
                18
                +
                Math.random()
                *
                22,

            rotation:
                Math.random()
                *
                Math.PI,

            rotationSpeed:
                (Math.random() - .5)
                *
                .05,

            color:
                CONFETTI_COLORS[
                    Math.floor(
                        Math.random()
                        *
                        CONFETTI_COLORS.length
                    )
                ],

            life: 1,

            decay: .001,

            shape: "ribbon",

            sway:
                2
                +
                Math.random()
                *
                2,

            swayFreq:
                .008
                +
                Math.random()
                *
                .015,

            swayPhase:
                Math.random()
                *
                Math.PI
                *
                2
        });
    }
}

/* ================================
   PARTICLE ANIMATION
================================ */

function animateParticles() {

    if (!celebrationRunning) {

        ctx.clearRect(
            0,
            0,
            celebrationCanvas.width,
            celebrationCanvas.height
        );

        animLoopActive = false;

        return;
    }

    frameCount++;

    ctx.clearRect(
        0,
        0,
        celebrationCanvas.width,
        celebrationCanvas.height
    );

    particles.forEach(
        p => {

            if (p.sway) {

                p.x +=
                    Math.sin(
                        frameCount
                        *
                        p.swayFreq
                        +
                        p.swayPhase
                    )
                    *
                    p.sway
                    *
                    .1;
            }

            p.x += p.vx;

            p.y += p.vy;

            p.vy += p.gravity;

            p.vx *= p.drag;

            p.rotation +=
                p.rotationSpeed;

            p.life -=
                p.decay;

            ctx.save();

            ctx.translate(
                p.x,
                p.y
            );

            ctx.rotate(
                p.rotation
            );

            ctx.globalAlpha =
                Math.max(
                    p.life,
                    0
                );

            ctx.fillStyle =
                p.color;

            if (
                p.shape === "circle"
            ) {

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    p.size / 2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            } else if (
                p.shape === "ribbon"
            ) {

                ctx.fillRect(
                    -p.size / 8,
                    -p.size / 2,
                    p.size / 4,
                    p.size
                );

            } else {

                ctx.fillRect(
                    -p.size / 2,
                    -p.size / 4,
                    p.size,
                    p.size / 2
                );
            }

            ctx.restore();
        }
    );

    particles =
        particles.filter(
            p =>
                p.life > 0
                &&
                p.y
                <
                celebrationCanvas.height
                +
                150
        );

    requestAnimationFrame(
        animateParticles
    );
}

/* ================================
   AMBIENT GOLD SPARKLES
================================ */

function startAmbientSparkles() {

    sparkleCanvas.style.display =
        "block";

    sparkles = [];

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        sparkles.push({

            x:
                Math.random()
                *
                sparkleCanvas.width,

            y:
                Math.random()
                *
                sparkleCanvas.height,

            size:
                1
                +
                Math.random()
                *
                4,

            opacity:
                Math.random(),

            speed:
                .2
                +
                Math.random()
                *
                .8,

            phase:
                Math.random()
                *
                Math.PI
                *
                2
        });
    }

    sparkleRunning = true;

    animateSparkles();

    clearTimeout(
        sparkleTimer
    );

    sparkleTimer =
        setTimeout(
            () => {

                sparkleRunning = false;

                sparkleCanvas.style.display =
                    "none";

                sparkles = [];

            },
            6500
        );
}

function animateSparkles() {

    if (!sparkleRunning) {

        sparkleCtx.clearRect(
            0,
            0,
            sparkleCanvas.width,
            sparkleCanvas.height
        );

        return;
    }

    sparkleCtx.clearRect(
        0,
        0,
        sparkleCanvas.width,
        sparkleCanvas.height
    );

    sparkles.forEach(
        s => {

            s.phase += .05;

            s.y -= s.speed;

            if (s.y < 0) {

                s.y =
                    sparkleCanvas.height;
            }

            const alpha =
                .25
                +
                Math.abs(
                    Math.sin(
                        s.phase
                    )
                )
                *
                .75;

            sparkleCtx.save();

            sparkleCtx.globalAlpha =
                alpha;

            sparkleCtx.fillStyle =
                "#ffd54f";

            sparkleCtx.beginPath();

            sparkleCtx.moveTo(
                s.x,
                s.y - s.size * 2
            );

            sparkleCtx.lineTo(
                s.x + s.size,
                s.y
            );

            sparkleCtx.lineTo(
                s.x,
                s.y + s.size * 2
            );

            sparkleCtx.lineTo(
                s.x - s.size,
                s.y
            );

            sparkleCtx.closePath();

            sparkleCtx.fill();

            sparkleCtx.restore();
        }
    );

    requestAnimationFrame(
        animateSparkles
    );
}
