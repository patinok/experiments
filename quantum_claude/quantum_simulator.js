// TODO момент электрона при излучениии
// визуальный эффект поглощения электрона
const canvas = document.getElementById('quantumCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const numElectrons = 5;
const numPhotons = 30;
const dt = 0.05;
let time = 0;

class Particle {
    constructor(type, x, y, px, py) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.px = px;
        this.py = py;
        this.mass = type === 'electron' ? 1 : 0.5;
        this.sigma = type === 'electron' ? 20 : 10;
        this.coherence = 1;
        this.collapsed = false;
        this.collapsedTime = 0;
        this.excitement = type === 'electron' ? 0 : null;
        this.spin = type === 'electron' ? (Math.random() < 0.5 ? 0.5 : -0.5) : null;
        this.polarization = type === 'photon' ? Math.random() * Math.PI : null;
    }

    waveFunction(x, y) {
        // if (this.collapsed) {
        //     const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        //     return Math.exp(-distance / (this.sigma * 0.01));
        // }
        const A = 1 / (2 * Math.PI * Math.pow(this.sigma * this.coherence, 2));
        const exp = -(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)) / (4 * Math.pow(this.sigma * this.coherence, 2));
        return A * Math.exp(exp);
    }

    move() {
        this.x += this.px * dt / this.mass;
        this.y += this.py * dt / this.mass;
        
        this.x = (this.x + width) % width;
        this.y = (this.y + height) % height;

        this.coherence += 0.001;
        if (this.coherence > 1) {
            this.coherence = 1;
        }

        if (this.collapsed) {
            this.collapsedTime += dt;
            if (this.collapsedTime > 50) { // Частица остается в коллапсированном состоянии 2 секунды
                this.collapsed = false;
                this.collapsedTime = 0;
                // Даем частице новый случайный импульс после выхода из коллапса
                // this.px = (Math.random() - 0.5) * (this.type === 'electron' ? 2 : 5);
                // this.py = (Math.random() - 0.5) * (this.type === 'electron' ? 2 : 5);
            }
        }

        // Испускание нового фотона
        const randX = Math.random() * width;
        const randY = Math.random() * height;
        if (this.type === 'electron' && Math.random() < this.excitement && Math.random() / 1000000 < Math.pow(this.waveFunction(randX, randY), 2)) {
            this.excitement -= 0.1;
            this.collapse(randX, randY);

            const newPhoton = new Particle('photon', 
                this.x, this.y, 
                (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
            particles.push(newPhoton);
            newPhoton.coherence = 0;
        }
    }

    collapse(newX, newY) {
        // this.collapsed = true;
        this.collapsedTime = 0;
        this.coherence -= 0.3;
        if (this.coherence < 0) {
            this.coherence = 0;
        }
        // let newX, newY;
        // do {
        //     newX = Math.random() * width;
        //     newY = Math.random() * height;

        //     // ctx.fillStyle = this.type === 'electron' ? 'white' : 'yellow';
        //     // ctx.beginPath();
        //     // ctx.arc(newX, newY, this.collapsed ? 3 : 5, 0, 2 * Math.PI);
        //     // ctx.fill();
        //     // ctx.strokeStyle = 'black';
        //     // ctx.stroke();
        // // } while (Math.random() > this.waveFunction(newX, newY));
        // } while (Math.random() > Math.pow(this.waveFunction(newX, newY), 2));
        
        ctx.strokeStyle = 'blue';
        ctx.beginPath(); // Start a new path
        ctx.moveTo(this.x, this.y); // Move the pen to (30, 50)
        ctx.lineTo(newX, newY); // Draw a line to (150, 100)
        ctx.stroke(); // Render the path

        this.x = newX;
        this.y = newY;
        // Даем частице новый случайный импульс после коллапса
        this.px = (Math.random() - 0.5) * (this.type === 'electron' ? 2 : 5);
        this.py = (Math.random() - 0.5) * (this.type === 'electron' ? 2 : 5);
    }

    // collapse() {
    //     this.collapsed = true;
    //     this.collapsedTime = 0;
    //     // Применяем принцип неопределенности
    //     const uncertainty = 5;
    //     this.x += (Math.random() - 0.5) * uncertainty;
    //     this.y += (Math.random() - 0.5) * uncertainty;
    //     this.px += (Math.random() - 0.5) * uncertainty / this.mass;
    //     this.py += (Math.random() - 0.5) * uncertainty / this.mass;
    // }
}

const particles = [
    ...Array(numElectrons).fill().map(() => new Particle('electron', Math.random() * width, Math.random() * height, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)),
    ...Array(numPhotons).fill().map(() => new Particle('photon', Math.random() * width, Math.random() * height, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5))
];

// function checkCollisions() {
//     for (let i = 0; i < particles.length; i++) {
//         for (let j = i + 1; j < particles.length; j++) {
//             const dx = particles[i].x - particles[j].x;
//             const dy = particles[i].y - particles[j].y;
//             const distance = Math.sqrt(dx * dx + dy * dy);
            
//             if (distance < 5 && !particles[i].collapsed && !particles[j].collapsed) {
//                 particles[i].collapse();
//                 particles[j].collapse();
//             }
//         }
//     }
// }

function drawWaveFunctions() {
    const imageData = ctx.createImageData(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let electronProb = 0;
            let electronExcitement = 0;
            let photonProb = 0;

            particles.forEach(particle => {
                const prob = particle.waveFunction(x, y);
                if (particle.type === 'electron') {
                    electronProb += prob * (1 - particle.excitement);
                    electronExcitement += particle.excitement * prob;
                } else {
                    photonProb += prob;
                }
            });

            const index = (y * width + x) * 4;
            imageData.data[index] = Math.min(255, photonProb * 100000); // Red for photons
            imageData.data[index + 1] = Math.min(255, electronExcitement * 300000);
            imageData.data[index + 2] = Math.min(255, electronProb * 300000); // Blue for electrons
            imageData.data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawParticles() {
    particles.forEach(particle => {
        particle.move();

        // if (particle.collapsed) {
        if (particle.coherence < 0.1) {
            ctx.fillStyle = particle.type === 'electron' ? 'white' : 'yellow';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.collapsed ? 3 : 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    });

    // checkCollisions();
}

function checkInteractions() {
    const randX = Math.random() * width;
    const randY = Math.random() * height;
    for (let i = 0; i < particles.length; i++) {
        // Коллапс при приближении к краю экрана
        // if (particles[i].x < 10 || particles[i].x > width - 10 || 
        //     particles[i].y < 10 || particles[i].y > height - 10) {
        //     particles[i].collapse();
        // }

        // Взаимодействие электронов с фотонами
        if (particles[i].type === 'electron') {
            for (let j = 0; j < particles.length; j++) {
                if (particles[j].type === 'photon') {
                    // const dx = particles[i].x - particles[j].x;
                    // const dy = particles[i].y - particles[j].y;
                    // const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // if (distance < 30 && Math.random() < 0.001) {  // 10% шанс взаимодействия
                    if (Math.random() / 100000 < (particles[i].waveFunction(randX, randY) * particles[j].waveFunction(randX, randY))) {
                        particles[i].excitement += 0.1;
                        // Поглощение фотона
                        particles[i].px += particles[j].px;
                        particles[i].py += particles[j].py;

                        ctx.strokeStyle = 'red';
                        ctx.beginPath(); // Start a new path
                        ctx.moveTo(particles[i].x, particles[i].y); // Move the pen to (30, 50)
                        ctx.lineTo(particles[j].x, particles[j].y); // Draw a line to (150, 100)
                        ctx.stroke(); // Render the path

                        particles.splice(j, 1);
                    }
                }
            }
        }
    }
}

function animate() {
    drawWaveFunctions();
    drawParticles();
    checkInteractions();

    time += dt;
    requestAnimationFrame(animate);
}

animate();
