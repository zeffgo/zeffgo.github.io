// utilities `library` :)

// image src randomizer
export function getRandomImage() {
    const [basePath, imgSuffix] = ['/images', '.jpg'];
    const randomFile = () => {
        const rf = Math.floor((Math.random() * 7) + 1) + imgSuffix;
        return [
            basePath,
            rf
        ].join('/');
    }
    let imgSrc = randomFile();
    const lastImg = window.localStorage.getItem('lastImg');
    while(!imgSrc || lastImg===imgSrc) {
        imgSrc = randomFile();
    }
    window.localStorage.setItem('lastImg', imgSrc);
    return imgSrc;
}

export function pageReload() {
    window.location.reload();
}

export const randomBtnText = 'randomize image!';

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
    var timeout;

    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};
