
function showPage(id) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');

  if (id === 'match') {
    drawGame();
  }
}

let coins = 2500;

const players = [
  {name: "STRIKER", rating: 91, price: 900, icon: "⚡"},
  {name: "GOALKEEPER", rating: 89, price: 800, icon: "🧤"},
  {name: "MIDFIELDER", rating: 88, price: 700, icon: "⭐"},
  {name: "DEFENDER", rating: 87, price: 650, icon: "🛡️"}
];

const team = [players[0]];

function createCard(player, isStore) {
  const div = document.createElement('div');
  div.className = 'player';

  div.innerHTML = `
    <h3>${player.rating}</h3>
    <div style="font-size:40px">${player.icon}</div>
    <p>${player.name}</p>
    <small>${isStore ? player.price + ' 🪙' : 'لاعب في الفريق'}</small>
  `;

  if (isStore) {
    const button = document.createElement('button');
    button.textContent = 'شراء';

    button.onclick = () => {
      if (coins < player.price) {
        alert('عملات غير كافية!');
        return;
      }

      coins -= player.price;
      team.push(player);

      document.getElementById('coins').textContent = coins;
      renderTeam();
      button.disabled = true;
      button.textContent = 'تم الشراء';
    };

    div.appendChild(button);
  }

  return div;
}

function renderTeam() {
  const area = document.getElementById('teamCards');
  area.innerHTML = '';

  team.forEach(player => {
    area.appendChild(createCard(player, false));
  });
}

players.forEach(player => {
  document.getElementById('storeCards')
    .appendChild(createCard(player, true));
});

renderTeam();

// نظام المباراة
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player = {x:200, y:250};
let ball = {x:250, y:250};
let score = 0;

function drawGame() {
  ctx.clearRect(0,0,900,500);

  for(let i=0;i<10;i++) {
    ctx.fillStyle = i%2 ? '#288653' : '#23784c';
    ctx.fillRect(i*90,0,90,500);
  }

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.strokeRect(15,15,870,470);

  ctx.beginPath();
  ctx.moveTo(450,15);
  ctx.lineTo(450,485);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(450,250,70,0,Math.PI*2);
  ctx.stroke();

  ctx.fillStyle = '#247de0';
  ctx.beginPath();
  ctx.arc(player.x,player.y,20,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,10,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#e7bd61';
  ctx.fillRect(860,190,25,120);
}

function movePlayer(dx,dy) {
  player.x = Math.max(35,Math.min(840,player.x+dx*20));
  player.y = Math.max(35,Math.min(465,player.y+dy*20));

  drawGame();
}

function shoot() {
  const distance = Math.hypot(
    ball.x-player.x,
    ball.y-player.y
  );

  if(distance < 90) {
    ball.x = Math.min(900,ball.x+100);

    if(ball.x >= 850) {
      score++;
      document.getElementById('score').textContent =
        score + ' - 0';

      ball.x = 250;
      ball.y = 250;
    }
  }

  drawGame();
}

drawGame();

import * as THREE from
  'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// إعداد المشهد
const container = document.getElementById('game3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9cc9df);
scene.fog = new THREE.Fog(0x9cc9df, 45, 100);

// الكاميرا
const camera = new THREE.PerspectiveCamera(
  48,
  1,
  0.1,
  200
);

camera.position.set(0, 23, 29);
camera.lookAt(0, 0, 0);

// الرسومات
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// الإضاءة
scene.add(new THREE.HemisphereLight(0xffffff, 0x315b43, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(-12, 25, 15);
sun.castShadow = true;
scene.add(sun);

// الملعب
const field = new THREE.Mesh(
  new THREE.PlaneGeometry(32, 50),
  new THREE.MeshStandardMaterial({
    color: 0x247b48,
    roughness: 1
  })
);

field.rotation.x = -Math.PI / 2;
field.receiveShadow = true;
scene.add(field);

// خطوط الملعب
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff
});

function line(points) {
  const geometry = new THREE.BufferGeometry()
    .setFromPoints(points);

  scene.add(new THREE.Line(geometry, lineMaterial));
}

function drawRectangle(x1, z1, x2, z2) {
  line([
    new THREE.Vector3(x1, 0.035, z1),
    new THREE.Vector3(x2, 0.035, z1),
    new THREE.Vector3(x2, 0.035, z2),
    new THREE.Vector3(x1, 0.035, z2),
    new THREE.Vector3(x1, 0.035, z1)
  ]);
}

drawRectangle(-15, -24, 15, 24);

line([
  new THREE.Vector3(-15, 0.04, 0),
  new THREE.Vector3(15, 0.04, 0)
]);

const circlePoints = [];

for (let i = 0; i <= 64; i++) {
  const a = i / 64 * Math.PI * 2;

  circlePoints.push(
    new THREE.Vector3(
      Math.cos(a) * 4,
      0.04,
      Math.sin(a) * 4
    )
  );
}

line(circlePoints);

// منطقة الجزاء
drawRectangle(-8, -24, 8, -17);
drawRectangle(-8, 24, 8, 17);

// المرمى
function createGoal(z) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff
  });

  function post(x, y, depth) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, y, depth),
      material
    );

    mesh.position.set(x, y / 2, z);
    scene.add(mesh);
  }

  post(-4, 2.5, 0.18);
  post(4, 2.5, 0.18);

  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.18, 0.18),
    material
  );

  crossbar.position.set(0, 2.5, z);
  scene.add(crossbar);
}

createGoal(-24);
createGoal(24);

// إنشاء لاعب
function createPlayer(color, number) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.7, 4, 8),
    new THREE.MeshStandardMaterial({ color })
  );

  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf0c5a0 })
  );

  head.position.y = 1.5;
  group.add(head);

  group.userData.number = number;

  return group;
}

// اللاعب الرئيسي
const player = createPlayer(0x1976e9, 10);
player.position.set(0, 0, 10);
scene.add(player);

// المنافسون
const enemies = [];

[
  [-6, -8],
  [6, -8],
  [-3, -15],
  [3, -15],
  [0, -20]
].forEach((position, index) => {
  const enemy = createPlayer(0xd83d3d, index + 1);

  enemy.position.set(position[0], 0, position[1]);

  scene.add(enemy);
  enemies.push(enemy);
});

// الحارس
const goalkeeper = createPlayer(0xffc52e, 1);
goalkeeper.position.set(0, 0, -22);
scene.add(goalkeeper);

// الكرة
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 24, 24),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45
  })
);

ball.position.set(0, 0.35, 8);
ball.castShadow = true;
scene.add(ball);

// متغيرات الحركة
const velocity = new THREE.Vector3();
const keys = {};

let score = 0;
let lastTime = 0;
let shootingCooldown = 0;

function updateScore() {
  const scoreElement = document.getElementById('score');

  if (scoreElement) {
    scoreElement.textContent = score + ' - 0';
  }
}

// التحكم باللاعب
function movePlayer(dx, dz) {
  player.position.x += dx * 0.8;
  player.position.z += dz * 0.8;

  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -14, 14
  );

  player.position.z = THREE.MathUtils.clamp(
    player.position.z, -23, 23
  );
}

function shoot() {
  if (shootingCooldown > 0) return;

  const distance = player.position.distanceTo(ball.position);

  if (distance < 2.5) {
    velocity.set(0, 0, -15);
    shootingCooldown = 0.4;
  }
}

window.movePlayer = movePlayer;
window.shoot = shoot;

// لوحة المفاتيح
window.addEventListener('keydown', event => {
  keys[event.key.toLowerCase()] = true;

  if (event.code === 'Space') {
    event.preventDefault();
    shoot();
  }
});

window.addEventListener('keyup', event => {
  keys[event.key.toLowerCase()] = false;
});

// حركة المنافسين
function updateEnemies(delta) {
  enemies.forEach((enemy, index) => {
    const target = index % 2 === 0
      ? player.position
      : ball.position;

    const direction = new THREE.Vector3()
      .subVectors(target, enemy.position);

    direction.y = 0;

    if (direction.length() > 2) {
      direction.normalize();

      enemy.position.addScaledVector(
        direction,
        delta * 1.5
      );
    }

    enemy.position.x = THREE.MathUtils.clamp(
      enemy.position.x, -14, 14
    );

    enemy.position.z = THREE.MathUtils.clamp(
      enemy.position.z, -23, 23
    );
  });
}

// حركة الكرة
function updateBall(delta) {
  ball.position.x += velocity.x * delta;
  ball.position.z += velocity.z * delta;

  velocity.multiplyScalar(0.985);

  if (Math.abs(velocity.x) < 0.05) velocity.x = 0;
  if (Math.abs(velocity.z) < 0.05) velocity.z = 0;

  if (ball.position.x > 15 || ball.position.x < -15) {
    velocity.x *= -0.7;
  }

  if (ball.position.z > 24 || ball.position.z < -24) {
    if (Math.abs(ball.position.x) < 4) {
      if (ball.position.z < 0) {
        score++;
        updateScore();
      }

      ball.position.set(0, 0.35, 8);
      velocity.set(0, 0, 0);
    } else {
      velocity.z *= -0.7;
    }
  }

  // ملامسة اللاعب للكرة
  const distance = player.position.distanceTo(ball.position);

  if (distance < 1.2 && velocity.length() < 4) {
    const direction = new THREE.Vector3(
      ball.position.x - player.position.x,
      0,
      ball.position.z - player.position.z
    ).normalize();

    velocity.addScaledVector(direction, 3);
  }
}

// تحديث الكاميرا
function updateCamera() {
  camera.position.x = player.position.x * 0.25;
  camera.position.z = player.position.z + 19;

  camera.lookAt(
    player.position.x * 0.15,
    0,
    player.position.z - 4
  );
}

// تحديث الشاشة
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize);
resize();

// حلقة اللعبة
function animate(time) {
  requestAnimationFrame(animate);

  const delta = Math.min((time - lastTime) / 1000 || 0, 0.04);
  lastTime = time;

  const speed = 7 * delta;

  if (keys['arrowleft'] || keys['a']) {
    player.position.x -= speed;
  }

  if (keys['arrowright'] || keys['d']) {
    player.position.x += speed;
  }

  if (keys['arrowup'] || keys['w']) {
    player.position.z -= speed;
  }

  if (keys['arrowdown'] || keys['s']) {
    player.position.z += speed;
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x,-14,14);
  player.position.z = THREE.MathUtils.clamp(player.position.z,-23,23);

  shootingCooldown = Math.max(0, shootingCooldown - delta);

  updateEnemies(delta);
  updateBall(delta);
  updateCamera();

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// إعداد المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bc5ed);

// الكاميرا
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 32, 43);
camera.lookAt(0, 0, 0);

// العرض
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;

document.getElementById("game-container").appendChild(renderer.domElement);

// الإضاءة
scene.add(new THREE.HemisphereLight(0xffffff, 0x477044, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(-15, 35, 15);
sun.castShadow = true;
scene.add(sun);

// الملعب
const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 58),
    new THREE.MeshStandardMaterial({ color: 0x168b45 })
);

grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

// خطوط الملعب
function line(x1, z1, x2, z2) {
    const points = [
        new THREE.Vector3(x1, 0.04, z1),
        new THREE.Vector3(x2, 0.04, z2)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const mesh = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    scene.add(mesh);
}

line(-45,-29,45,-29);
line(-45,29,45,29);
line(-45,-29,-45,29);
line(45,-29,45,29);
line(0,-29,0,29);

// دائرة الوسط
const circle = new THREE.Mesh(
    new THREE.RingGeometry(7.8, 8, 64),
    new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide})
);
circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.05;
scene.add(circle);

// منطقة الجزاء
function box(x,z,w,h) {
    const edges = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(w,0.05,h)
    );
    const mesh = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({color:0xffffff})
    );
    mesh.position.set(x,0.04,z);
    scene.add(mesh);
}

box(-38,0,14,30);
box(38,0,14,30);

// المرمى
function createGoal(x) {
    const material = new THREE.MeshStandardMaterial({color:0xffffff});
    const postGeometry = new THREE.CylinderGeometry(.16,.16,5,8);

    for(const z of [-4,4]) {
        const post = new THREE.Mesh(postGeometry,material);
        post.position.set(x,2.5,z);
        scene.add(post);
    }

    const bar = new THREE.Mesh(
        new THREE.BoxGeometry(.2, .2, 8),
        material
    );
    bar.position.set(x,5,0);
    scene.add(bar);
}

createGoal(-45);
createGoal(45);

// الكرة
const ball = new THREE.Mesh(
    new THREE.SphereGeometry(.65,20,20),
    new THREE.MeshStandardMaterial({color:0xffffff})
);

ball.position.set(0,.7,0);
scene.add(ball);

// اللاعبون
const players = [];
const teamColors = [0x147bff,0xe63d42];

function createPlayer(team,index,x,z) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(.65,.75,2,12),
        new THREE.MeshStandardMaterial({color:teamColors[team]})
    );

    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(.48,12,12),
        new THREE.MeshStandardMaterial({color:0xe9bd91})
    );

    head.position.y = 2.3;
    group.add(head);

    group.position.set(x,0,z);
    scene.add(group);

    players.push({
        mesh:group,
        team,
        index,
        x,
        z,
        homeX:x,
        homeZ:z,
        speed:0.12
    });
}

// توزيع 11 لاعباً لكل فريق
const formation = [
    [0,0],[-12,-18],[-12,-6],[-12,6],[-12,18],
    [-25,-19],[-25,-7],[-25,7],[-25,19],
    [-34,-8],[-34,8]
];

for(let i=0;i<11;i++) {
    const [x,z] = formation[i];

    createPlayer(0,i,x,z);

    createPlayer(1,i,-x,-z);
}

// اللاعب الذي يتحكم به المستخدم
let activePlayer = players[9];
let ballVelocity = new THREE.Vector3();
let scoreHome = 0;
let scoreAway = 0;
let elapsed = 0;
let running = false;

const keys = {};
const controls = {
    up:false,down:false,left:false,right:false
};

window.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup",e=>{
    keys[e.key.toLowerCase()] = false;
});

// أزرار الهاتف والكمبيوتر
function bindButton(id,key) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown",e=>{
        e.preventDefault();
        controls[key] = true;
    });

    ["pointerup","pointerleave","pointercancel"].forEach(event=>{
        button.addEventListener(event,()=>{
            controls[key] = false;
        });
    });
}

bindButton("up","up");
bindButton("down","down");
bindButton("left","left");
bindButton("right","right");

// معرفة أقرب لاعب للكرة
function nearestPlayer(team) {
    return players
        .filter(p=>p.team===team)
        .sort((a,b)=>
            a.mesh.position.distanceTo(ball.position) -
            b.mesh.position.distanceTo(ball.position)
        )[0];
}

// تمرير الكرة
function passBall() {
    const target = players
        .filter(p=>p.team===0 && p!==activePlayer)
        .sort((a,b)=>
            a.mesh.position.distanceTo(activePlayer.mesh.position)-
            b.mesh.position.distanceTo(activePlayer.mesh.position)
        )[0];

    if(activePlayer.mesh.position.distanceTo(ball.position)<3) {
        const direction = new THREE.Vector3(
            target.x-activePlayer.x,0,target.z-activePlayer.z
        ).normalize();

        ballVelocity.copy(direction.multiplyScalar(.85));
    }
}

// التسديد
function shootBall() {
    if(activePlayer.mesh.position.distanceTo(ball.position)<3) {
        const direction = new THREE.Vector3(
            1,0,-(ball.position.z/50)
        ).normalize();

        ballVelocity.copy(direction.multiplyScalar(1.8));
    }
}

document.getElementById("pass").addEventListener("click",passBall);
document.getElementById("shoot").addEventListener("click",shootBall);

document.getElementById("switch").addEventListener("click",()=>{
    activePlayer = nearestPlayer(0);
});

// الذكاء الاصطناعي المبسط
function moveAI(p,dt) {
    let tx=p.homeX, tz=p.homeZ;

    const chaser=nearestPlayer(p.team);

    if(chaser===p) {
        tx=ball.position.x;
        tz=ball.position.z;
    }

    const dx=tx-p.x;
    const dz=tz-p.z;
    const length=Math.hypot(dx,dz);

    if(length>1) {
        p.x+=(dx/length)*p.speed*dt;
        p.z+=(dz/length)*p.speed*dt;
    }
}

// تحديث المباراة
function update(dt) {
    if(!running)return;

    elapsed+=dt;
    document.getElementById("timer").textContent =
        String(Math.floor(elapsed/60)).padStart(2,"0")+":"+
        String(Math.floor(elapsed%60)).padStart(2,"0");

    let dx=0,dz=0;

    if(keys.w||keys.arrowup||controls.up)dz-=1;
    if(keys.s||keys.arrowdown||controls.down)dz+=1;
    if(keys.a||keys.arrowleft||controls.left)dx-=1;
    if(keys.d||keys.arrowright||controls.right)dx+=1;

    const length=Math.hypot(dx,dz)||1;
    activePlayer.x+=dx/length*.20*dt*60;
    activePlayer.z+=dz/length*.20*dt*60;

    activePlayer.x=THREE.MathUtils.clamp(activePlayer.x,-43,43);
    activePlayer.z=THREE.MathUtils.clamp(activePlayer.z,-27,27);

    // حركة اللاعبين الـ21 الآخرين
    for(const p of players) {
        if(p!==activePlayer)moveAI(p,dt*60);
        p.mesh.position.set(p.x,0,p.z);
    }

    // حركة الكرة
    ball.position.x+=ballVelocity.x*dt*60;
    ball.position.z+=ballVelocity.z*dt*60;
    ballVelocity.multiplyScalar(.985);

    // التقاط الكرة
    if(ballVelocity.length()<.12) {
        const close=players
            .filter(p=>p.mesh.position.distanceTo(ball.position)<2.2)
            .sort((a,b)=>
                a.mesh.position.distanceTo(ball.position)-
                b.mesh.position.distanceTo(ball.position)
            )[0];

        if(close) {
            ball.position.x=close.x+(close.team===0?1:-1);
            ball.position.z=close.z;
        }
    }

    // حدود الملعب
    if(Math.abs(ball.position.z)>28)ballVelocity.z*=-.7;

    // احتساب الهدف
    if(ball.position.x>46 && Math.abs(ball.position.z)<4) {
        scoreHome++;
        resetAfterGoal();
    }

    if(ball.position.x<-46 && Math.abs(ball.position.z)<4) {
        scoreAway++;
        resetAfterGoal();
    }

    document.getElementById("score").textContent =
        scoreHome+" - "+scoreAway;

    // الكاميرا تتبع اللاعب
    camera.position.x+=(activePlayer.x-camera.position.x)*.025;
    camera.position.z+=(activePlayer.z+38-camera.position.z)*.025;
    camera.lookAt(activePlayer.x,0,activePlayer.z);
}

function resetAfterGoal() {
    ball.position.set(0,.7,0);
    ballVelocity.set(0,0,0);
    players.forEach(p=>{
        p.x=p.homeX;p.z=p.homeZ;
        p.mesh.position.set(p.x,0,p.z);
    });
}

// بدء المباراة
document.getElementById("startBtn").addEventListener("click",()=>{
    running=true;
    document.getElementById("startOverlay").style.display="none";
});

document.getElementById("startOverlay").querySelector("button")
    .addEventListener("click",()=>{running=true;});

// حلقة الرسم
const clock=new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.04);
    update(dt);
    renderer.render(scene,camera);
}

window.addEventListener("resize",()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});

animate();

import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// بيانات اللعبة
const defaultPlayers = [
 {name:"Goalkeeper",pos:"GK",rating:85,price:0},
 {name:"Defender 1",pos:"CB",rating:83,price:1200},
 {name:"Defender 2",pos:"CB",rating:82,price:1100},
 {name:"Defender 3",pos:"LB",rating:81,price:1000},
 {name:"Defender 4",pos:"RB",rating:82,price:1100},
 {name:"Midfielder 1",pos:"CM",rating:86,price:1600},
 {name:"Midfielder 2",pos:"CM",rating:84,price:1400},
 {name:"Midfielder 3",pos:"CAM",rating:87,price:1800},
 {name:"Winger 1",pos:"LW",rating:88,price:2000},
 {name:"Striker",pos:"ST",rating:90,price:2500},
 {name:"Winger 2",pos:"RW",rating:87,price:1800}
];

const market = [
 {name:"Ronaldo",pos:"ST",rating:92,price:4000},
 {name:"Messi",pos:"RW",rating:93,price:4500},
 {name:"Mbappe",pos:"ST",rating:94,price:5000},
 {name:"Bellingham",pos:"CM",rating:90,price:3500},
 {name:"Neymar",pos:"LW",rating:91,price:3800},
 {name:"Haaland",pos:"ST",rating:93,price:4500}
];

let save = JSON.parse(localStorage.getItem("stFootballSave") || "null");

if(!save) {
 save = {
  coins:10000,
  players:defaultPlayers.map(p=>({...p})),
  formation:"4-3-3",
  sound:true
 };
}

function persist() {
 localStorage.setItem("stFootballSave",JSON.stringify(save));
 document.getElementById("coins").textContent=save.coins;
}

function renderTeam() {
 const box=document.getElementById("teamPlayers");
 box.innerHTML="";

 save.players.forEach((p,i)=>{
  const card=document.createElement("div");
  card.className="player-card";
  card.innerHTML=`
   <h3>${p.rating} OVR</h3>
   <h4>${p.name}</h4>
   <p>${p.pos}</p>
   <button data-upgrade="${i}">تطوير +1 (500)</button>
  `;
  box.appendChild(card);
 });

 box.querySelectorAll("[data-upgrade]").forEach(btn=>{
  btn.addEventListener("click",()=>{
   const i=Number(btn.dataset.upgrade);
   if(save.coins<500) return alert("رصيدك غير كافٍ");
   save.coins-=500;
   save.players[i].rating=Math.min(99,save.players[i].rating+1);
   persist();
   renderTeam();
  });
 });
}

function renderMarket() {
 const box=document.getElementById("marketPlayers");
 box.innerHTML="";

 market.forEach((p,i)=>{
  const card=document.createElement("div");
  card.className="player-card";
  card.innerHTML=`
   <h3>${p.rating} OVR</h3>
   <h4>${p.name}</h4>
   <p>${p.pos}</p>
   <p>${p.price} Coins</p>
   <button data-buy="${i}">شراء اللاعب</button>
  `;
  box.appendChild(card);
 });

 box.querySelectorAll("[data-buy]").forEach(btn=>{
  btn.addEventListener("click",()=>{
   const p=market[Number(btn.dataset.buy)];
   if(save.players.some(x=>x.name===p.name))
    return alert("هذا اللاعب موجود في فريقك");
   if(save.coins<p.price)
    return alert("رصيدك غير كافٍ");

   save.coins-=p.price;
   save.players.push({...p});
   persist();
   renderMarket();
   renderTeam();
   alert("تمت إضافة اللاعب إلى فريقك");
  });
 });
}

// التنقل بين الصفحات
function showPage(id) {
 document.querySelectorAll(".page").forEach(p=>
  p.classList.toggle("active",p.id===id)
 );
}

document.querySelectorAll("[data-page]").forEach(btn=>{
 btn.addEventListener("click",()=>showPage(btn.dataset.page));
});

document.getElementById("formation").addEventListener("change",e=>{
 save.formation=e.target.value;
 persist();
});

document.getElementById("sound").addEventListener("change",e=>{
 save.sound=e.target.checked;
 persist();
});

document.getElementById("reset").addEventListener("click",()=>{
 if(confirm("هل تريد إعادة ضبط اللعبة؟")) {
  localStorage.removeItem("stFootballSave");
  location.reload();
 }
});

document.getElementById("play").addEventListener("click",()=>{
 showPage("match");
 startMatch();
});

document.getElementById("backHome").addEventListener("click",()=>{
 stopMatch();
 showPage("home");
});

document.getElementById("formation").value=save.formation;
document.getElementById("sound").checked=save.sound;
persist();
renderTeam();
renderMarket();

// محرك مباراة ثلاثي الأبعاد مبسط
let renderer,scene,camera,ball,players3D=[];
let matchRunning=false,animationId=null;
let scoreA=0,scoreB=0;

function startMatch() {
 if(matchRunning)return;
 const container=document.getElementById("game-container");
 const w=container.clientWidth;
 const h=container.clientHeight;

 scene=new THREE.Scene();
 scene.background=new THREE.Color(0x9bc9e8);

 camera=new THREE.PerspectiveCamera(50,w/h,.1,200);
 camera.position.set(0,43,48);
 camera.lookAt(0,0,0);

 renderer=new THREE.WebGLRenderer({antialias:true});
 renderer.setSize(w,h);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 container.replaceChildren(renderer.domElement);

 scene.add(new THREE.HemisphereLight(0xffffff,0x477044,2));

 const sun=new THREE.DirectionalLight(0xffffff,2);
 sun.position.set(-20,40,20);
 scene.add(sun);

 const field=new THREE.Mesh(
  new THREE.PlaneGeometry(100,64),
  new THREE.MeshStandardMaterial({color:0x168647})
 );
 field.rotation.x=-Math.PI/2;
 scene.add(field);

 function line(x1,z1,x2,z2) {
  const g=new THREE.BufferGeometry().setFromPoints([
   new THREE.Vector3(x1,.06,z1),
   new THREE.Vector3(x2,.06,z2)
  ]);
  scene.add(new THREE.Line(g,
   new THREE.LineBasicMaterial({color:0xffffff})));
 }

 line(-50,-32,50,-32);
 line(-50,32,50,32);
 line(-50,-32,-50,32);
 line(50,-32,50,32);
 line(0,-32,0,32);

 ball=new THREE.Mesh(
  new THREE.SphereGeometry(.7,16,12),
  new THREE.MeshStandardMaterial({color:0xffffff})
 );
 ball.position.set(0,.7,0);
 scene.add(ball);

 players3D=[];

 const positions=[
  [-44,0],[-30,-22],[-30,-7],[-30,7],[-30,22],
  [-17,-18],[-17,-6],[-17,6],[-17,18],[-7,-7],[-7,7]
 ];

 for(let team=0;team<2;team++) {
  positions.forEach((pos,i)=>{
   const mesh=new THREE.Mesh(
    new THREE.CapsuleGeometry(.7,1,4,8),
    new THREE.MeshStandardMaterial({
     color:team===0?0x147bff:0xe64145
    })
   );
   const x=team===0?pos[0]:-pos[0];
   const z=team===0?pos[1]:-pos[1];
   mesh.position.set(x,1,z);
   scene.add(mesh);
   players3D.push({
    mesh,team,x,z,homeX:x,homeZ:z
   });
  });
 }

 scoreA=scoreB=0;
 document.getElementById("matchScore").textContent="0 - 0";
 matchRunning=true;
 animateMatch();
}

function animateMatch() {
 if(!matchRunning)return;

 animationId=requestAnimationFrame(animateMatch);

 // تحريك مبسط للفرق نحو مواقعها
 players3D.forEach(p=>{
  const dx=p.homeX-p.x;
  const dz=p.homeZ-p.z;
  p.x+=dx*.015;
  p.z+=dz*.015;
  p.mesh.position.set(p.x,1,p.z);
 });

 renderer.render(scene,camera);
}

function stopMatch() {
 matchRunning=false;
 if(animationId)cancelAnimationFrame(animationId);
 if(renderer)renderer.dispose();
 players3D=[];
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js")
    .catch(error => console.error("SW error:", error));
}
