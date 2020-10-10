
let ldiv = null;
let an;
let ctx;
let vv = [2, 3, 4];
let dd = [1, 1, 1];
let ii = 0;

function init_loading() {
    ldiv = document.createElement('div');
    let gdiv = document.createElement('div');
    let canvas = document.createElement('canvas');
    let lb = document.createElement('label');
    ldiv.classList.add("loading-div");    
    canvas.height = 30;
    canvas.width = 70;
    lb.innerHTML = "Please wait";
    gdiv.classList.add("loading");    
    gdiv.appendChild(lb);
    gdiv.appendChild( document.createElement('br'));
    gdiv.appendChild(canvas);
    ldiv.appendChild(gdiv);
    document.body.appendChild(ldiv);
    ctx = canvas.getContext("2d");

    animate();
}

function cc() {
    for (ii = 0; ii < 3; ii++) {
        vv[ii]+=.5*dd[ii];

        if (vv[ii] > 8)
            dd[ii]=-1;
        if (vv[ii] <= 2)
            dd[ii]=1;
        }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.width);
    ctx.fillStyle = "rgb(3, 102, 214)";

    ctx.beginPath();   
    ctx.arc(15, 15, vv[0], 0, 2 * Math.PI);
    ctx.arc(35, 15, vv[1], 0, 2 * Math.PI);
    ctx.arc(55, 15, vv[2], 0, 2 * Math.PI);
    ctx.fill();
}

function setLoading(loading) {
    console.log('setLoading: ' + loading);

    if (ldiv == null)
        init_loading();

    if (loading) {
        ldiv.style.display = 'block';

        an = setInterval(() => {
            requestAnimationFrame(animate);
            cc();
        }, 60);
    } else {
        ldiv.style.display = 'none';

        clearInterval(an);
    }
}
