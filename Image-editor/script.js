let filters = {
    brightness: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    contrast: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    saturation: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    grayscale: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
    sepia: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
    blur: {
        value: 0,
        min: 0,
        max: 20,
        unit: "px"
    },
    hueRotate: {
        value: 0,
        min: 0,
        max: 360,
        unit: "deg"
    },
    invert: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
    opacity: {
        value: 100,
        min: 0,
        max: 100,
        unit: "%"
    }
};


let imginp = document.querySelector("#img-upload");
let resetButton = document.querySelector("#reset-button");
let downloadButton = document.querySelector("#download-button");
let filterContainer = document.querySelector(".range-filters");
let preview = document.querySelector(".preview");
let imgCanvas = document.querySelector("#image-canvas");
let canvasCtx = imgCanvas.getContext("2d");
let presetsContainer = document.querySelector(".presets");

let file = null;
let img = null;




// niche wala function filter create karke, DOM me add karega
function createFilterElement(name, value, min, max) {
    // <h4>Brighteness</h4>
    // <input type="range" min="0" max="200" value="100"></input>
    let div = document.createElement("div");
    div.classList.add("filter");

    let heading = document.createElement("h4");
    heading.textContent = name;

    let inp = document.createElement("input");
    inp.type = "range";
    inp.value = value;
    inp.min = min;
    inp.max = max;

    div.appendChild(heading);
    div.appendChild(inp);

    inp.addEventListener("input", (e) => {
        filters[name].value = inp.value; //e.target.value
        appplyFilter();
    })

    return div;
}


//ek ek filter add karege
function createFilters() {
    for (let filtername in filters) {
        let filterElement = createFilterElement(
            filtername,
            filters[filtername].value,
            filters[filtername].min,
            filters[filtername].max,
        );

        filterContainer.appendChild(filterElement);
    }
}
createFilters();


// OR Object.keys(filters).forEach((filterName)=> filters[filtername])
//.clearRect ko number chhaiye , imgCanvas.style.height string return karega, isliye imgCanvas.height use karte



function appplyFilter() {
    if (!img) return;

    canvasCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);

    canvasCtx.filter = `
    brightness(${filters.brightness.value}${filters.brightness.unit})
    contrast(${filters.contrast.value}${filters.contrast.unit})
    saturate(${filters.saturation.value}${filters.saturation.unit})
    grayscale(${filters.grayscale.value}${filters.grayscale.unit})
    sepia(${filters.sepia.value}${filters.sepia.unit})
    blur(${filters.blur.value}${filters.blur.unit})
    hue-rotate(${filters.hueRotate.value}${filters.hueRotate.unit})
    invert(${filters.invert.value}${filters.invert.unit})
    opacity(${filters.opacity.value}${filters.opacity.unit})
    `;

    canvasCtx.drawImage(img, 0, 0);
};



//image chhose-> image create -> load -> draw
imginp.addEventListener("change", (dets) => {
    file = dets.target.files[0]; //there can be multiple files, we want only 1.  files , not file

    if (!file) return;

    preview.querySelector("i").style.display = "none"; //should be string
    preview.querySelector("p").style.display = "none";
    imgCanvas.style.display = "block";

    img = new Image();   //Image I capital
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        imgCanvas.width = img.width;  //.width is attribute/property of canvas, not a style <canvas width="800" height="600"></canvas>
        imgCanvas.height = img.height;

        canvasCtx.drawImage(img, 0, 0);
    };
});




resetButton.addEventListener("click", () => {
    if (!img) return;
    filters = {
        brightness: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%"
        },
        contrast: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%"
        },
        saturation: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%"
        },
        grayscale: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%"
        },
        sepia: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%"
        },
        blur: {
            value: 0,
            min: 0,
            max: 20,
            unit: "px"
        },
        hueRotate: {
            value: 0,
            min: 0,
            max: 360,
            unit: "deg"
        },
        invert: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%"
        },
        opacity: {
            value: 100,
            min: 0,
            max: 100,
            unit: "%"
        }
    };
    appplyFilter();
    filterContainer.textContent = "";
    createFilters();
});

downloadButton.addEventListener("click", () => {
    if (!img) return;
    const link = document.createElement("a");
    link.href = imgCanvas.toDataURL(); //"image/png" "image/jpeg". Canvas ke andar jo pixels draw hue hain unko ek Base64 encoded URL string ex: data:image/png;base64,idcffcdsfd...
    link.download = "edited-image.png";  // special instruction to browser to donwload it ,instead of navigating
    link.click();
});




const presets = {
    original: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        blur: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100
    },

    vintage: {
        brightness: 110,
        contrast: 120,
        saturation: 80,
        grayscale: 10,
        sepia: 50,
        blur: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100
    },

    blackAndWhite: {
        brightness: 100,
        contrast: 120,
        saturation: 0,
        grayscale: 100,
        sepia: 0,
        blur: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100
    },

    warm: {
        brightness: 105,
        contrast: 110,
        saturation: 130,
        grayscale: 0,
        sepia: 25,
        blur: 0,
        hueRotate: 10,
        invert: 0,
        opacity: 100
    },

    cool: {
        brightness: 100,
        contrast: 110,
        saturation: 120,
        grayscale: 0,
        sepia: 0,
        blur: 0,
        hueRotate: 180,
        invert: 0,
        opacity: 100
    },

    dramatic: {
        brightness: 90,
        contrast: 160,
        saturation: 140,
        grayscale: 0,
        sepia: 0,
        blur: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100
    },

    faded: {
        brightness: 120,
        contrast: 80,
        saturation: 70,
        grayscale: 20,
        sepia: 15,
        blur: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100
    },

    dreamy: {
        brightness: 110,
        contrast: 90,
        saturation: 120,
        grayscale: 0,
        sepia: 10,
        blur: 2,
        hueRotate: 15,
        invert: 0,
        opacity: 95
    }
};


Object.keys(presets).forEach((presetName) => {
    let btn = document.createElement("button");
    btn.classList.add("btn");
    btn.textContent = presetName;

    btn.addEventListener("click", () => {

        Object.keys(presets[presetName]).forEach((filterName) => {

            filters[filterName].value = presets[presetName][filterName];

        });

        filterContainer.textContent = "";
        createFilters();
        appplyFilter();
    });

    presetsContainer.appendChild(btn);
});

