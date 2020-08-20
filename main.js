const VIEW_ANGLE = 45;
const NEAR = 0.1;
const FAR = 10000;
const D = 1;

const MODEL = 'models/lose_robot.gltf';

class Scene {
  constructor() {
    let opts = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true // for saving images
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(opts.width, opts.height);
    this.renderer.setClearColor(0xeeeeee, 0);

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x000000, 0.6 );
    this.scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    let aspect = opts.width/opts.height;
    this.camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, NEAR, FAR);
    this.camera.position.z = 12;
    this.camera.position.y = 5;
    this.camera.rotation.x = -Math.PI/8;
    window.camera = this.camera;
    this.camera.updateProjectionMatrix();

    window.addEventListener('resize', () => {
      opts.width = window.innerWidth;
      opts.height = window.innerHeight;
      let aspect = opts.width/opts.height;
      this.camera.left = -D * aspect;
      this.camera.right = D * aspect;
      this.camera.top = D;
      this.camera.bottom = -D;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(opts.width, opts.height);
    }, false);

    this.camera.zoom = 0.2;
  }

  add(mesh) {
    this.scene.add(mesh);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

const scene = new Scene();
document.body.appendChild(scene.renderer.domElement);

let model;
const loader = new THREE.GLTFLoader();
loader.load(MODEL, (gltf, mat) => {
  let child = gltf.scene.children[0];
  child.material.flatShading = true;
  child.material.fog = false;
  child.material.metalness = 0;
  child.material.map.generateMipmaps = false;
  child.material.map.magFilter = THREE.NearestFilter;
  child.material.map.minFilter = THREE.NearestFilter;
  child.material.needsUpdate = true;
  child.material.emissive = {r: 0.05, g: 0.05, b: 0.05};
  child.scale.set(0.25, 0.25, 0.25);
  child.rotation.y = -Math.PI/4;
  // child.rotation.x = Math.PI/6;
  scene.add(child);
  model = child;
  go();
});

let zip = new JSZip();
let folder = zip.folder('frames');

let i = 0;
let rotated = 0;
function go() {
  if (rotated <= 2*Math.PI) {
    model.rotation.y += 0.01;
    rotated += 0.01;
    scene.render();
    scene.renderer.domElement.toBlob((blob) => {
      console.log('ok');
      folder.file(`${String(i).padStart(4, '0')}.png`, blob);
      go();
    });
    i++;
  } else {
    zip.generateAsync({type: 'blob'})
      .then(function(content) {
        saveAs(content, 'frames.zip');
      });
  }
}