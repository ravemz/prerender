module.exports = {
	beforeExtractHTML: (req, res, next) => {
        const tab = req.prerender.tab;

        tab.Runtime.evaluate({
						// expression: `
						// 	var cssStyles = '';
						// 	for (let i = 0; i < document.styleSheets.length - 1; i++) {
						// 		let style = null;
						// 		let styleSheet = document.styleSheets[i];
						// 		if (styleSheet.href == null && styleSheet.ownerNode.textContent.trim() == '') {
						// 			style = styleSheet.rules;
						// 		}
						// 		for (let item in style) {
						// 			if (style[item].cssText != undefined) {
						// 				cssStyles += style[item].cssText;
						// 			}
						// 		}
						// 	}
						// 	var head = document.head || document.getElementsByTagName('head')[0];
						// 	var style = document.getElementById('styles-for-prerender');
						// 	if (style) {
						// 		style.setAttribute(
						// 			'iteration',
						// 			parseInt(style.getAttribute('iteration')) + 1
						// 		);
						// 		while (style.firstChild) {
						// 			style.removeChild(style.firstChild);
						// 		}
						// 	} else {
						// 		style = document.createElement('style');
						// 		style.setAttribute('iteration', '1');
						// 		head.appendChild(style);
						// 		style.id = 'styles-for-prerender';
						// 		style.type = 'text/css';
						// 	}
						// 	style.appendChild(document.createTextNode(cssStyles));
						// `
            expression: `for (styleSheet of document.styleSheets) {
                if (!styleSheet.href && styleSheet.ownerNode) {
                    if (styleSheet.ownerNode.innerText.trim() === '') {
                        const cssText = [].slice.call(styleSheet.cssRules)
                                .reduce(function (prev, cssRule) {
                                    return prev + cssRule.cssText;
                                }, '');
                        styleSheet.ownerNode.innerHTML = cssText;
                    }
                }
            }`
        });

		next();
	}
};
