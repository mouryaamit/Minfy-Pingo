/**
 * Created by Amit Mourya on 6/6/15.
 */
function getRandomLat() {
    return Math.random() * (90 - (-90)) + (-90);
}
function getRandomLong() {
    return Math.random() * (180 - (-180)) + (-180);
}