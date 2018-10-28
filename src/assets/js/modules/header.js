'use strict';


const __addOverlay = (classElt) => {
    const overlayElt = document.querySelector(classElt);

    overlayElt.classList.remove('d-none');
    setTimeout(() => {
        overlayElt.classList.remove('opacity-0');
    }, 50);
};

const __removeOverlay = (classElt) => {
    const overlayElt = document.querySelector(classElt);

    overlayElt.classList.add('opacity-0');
    setTimeout(() => {
        overlayElt.classList.add('d-none');
    }, 250);
};

const __toggleOverlay = () => {
    if (document.querySelector('.l-overlay')) {
        const overlayElt = document.querySelector('.l-overlay');
        
        if (overlayElt.classList.contains('opacity-0')) {
            __addOverlay('.l-overlay');
        }
        else {
            __removeOverlay('.l-overlay');
        }
    }
};


export function collapsePanelBtn(btn, panel, boolOverlay=false) {
    if (document.querySelector(btn) && document.querySelector(panel)) {
        const btnElt    = document.querySelector(btn);
        const panelElt  = document.querySelector(panel);

        btnElt.addEventListener('click', (e) => {
            e.preventDefault();
            const self  = e.target.closest(btn);
            self.classList.toggle('active');
            panelElt.classList.toggle('collapsed');

            if (boolOverlay != false) {
                __toggleOverlay();
            }
        });
    }
}

export function collapseOverlayPanel(btn, panel) {
    if (document.querySelector('.l-overlay') && document.querySelector(btn) && document.querySelector(panel)) {
        const overlayElt    = document.querySelector('.l-overlay');
        const btnElt        = document.querySelector(btn);
        const panelElt      = document.querySelector(panel);
        
        overlayElt.addEventListener('click', (e) => {
            e.preventDefault();
            __removeOverlay('.l-overlay');
            btnElt.classList.remove('active');
            panelElt.classList.add('collapsed');
        });
    }
};
