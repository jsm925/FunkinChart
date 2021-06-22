export const getElementDimensions = (element) => {
    let computedStyle = getComputedStyle(element);

    let height = element.clientHeight;
    let width = element.clientWidth;

    height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

    return { width, height };
};

export const copyArrayBuffer = (buffer) => {
    let copy = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(copy).set(new Uint8Array(buffer));
    return copy;
};

export function formatTime(seconds) {
    let s = seconds % 60;
    let m = (seconds - s) / 60; // Could use Math.floor too

    m = m.toString().padStart(2, "0");
    s = s.toFixed(2).padStart(5, "0");

    return `${m}:${s}`;
}

// overkill to handle negatives and overflow values
export function wrapIndex(value, length) {
    return (value % length + length) % length;
}