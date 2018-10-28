'use strict';

import * as moduleHeader from './modules/header';


document.addEventListener('DOMContentLoaded', () => {
    moduleHeader.collapsePanelBtn('.btn--main-panel', '.l-main-panel');
    moduleHeader.collapsePanelBtn('.btn--menu', '.l-menu-panel', true);
    moduleHeader.collapseOverlayPanel('.btn--menu', '.l-menu-panel');
});

