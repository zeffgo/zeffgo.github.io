import React, { Component } from 'react';
import PieceCanvas from './pieceCanvas';
import './mainCanvas.css';

// constants (class is a singleton)
let pos; // last known position
let positions = []; // tmp positions list
const grayFillHex = '#d3d3d3';
const canvasRef = 'myCanvas';
let isDrawing;
let maxX = 0;
let maxY = 0;
let minX = 0;
let minY = 0;
const minPositionsToDraw = 10;  // less than this is probably a dot, too small to play with.

class MainCanvas extends Component {

    constructor(props) {
        super(props);
        let me = this;
        me.state = {
            imgSrc: props.src,
            pieces: []
        }

        me.onPieceRemove    = me.onPieceRemove.bind(me);
        me.setPosition      = me.setPosition.bind(me);
        me.endDrawing       = me.endDrawing.bind(me);
        me.draw             = me.draw.bind(me);
    }

    //#region utils
    getContext() {
        const me = this;
        const c = me.refs.myCanvas;
        const ctx = c.getContext('2d');
        return ctx;
    }
    //#endregion

    //#region lifecycle and related
    componentDidMount() {
        const me = this;
        me.setupImage();
        me.setupListeners();
    }

    // filter out removed piece, trigger reflow, re-init canvas (must use js for canvas, so React render is not enough)
    onPieceRemove(id) {
        const me = this;
        const pieces = me.state.pieces.filter(x => x.props.uid !== id);
        me.setState({
            pieces: pieces
        }, me.restartAndReplot);
    }

    restartAndReplot() {
        const me = this;

        // fast forward whole process without removed piece.
        me.setupImage()    // redraw image
            .then(function () {
                // now redraw shadows for pieces (pieces are simply rendered from a list in .render,
                // TODO: find a way to move this to Piece control. Problem: will have to use local(parent) context(= coupling)
                me.state.pieces.forEach((p) => {
                    const ctx = me.getContext();
                    ctx.beginPath(); // begin
                    const positions = p.props.positions;
                    positions.forEach((pos) => me.draw(null, true, pos));
                    me.endDrawing(null, true);
                });
            });
    }
    //#endregion

    //#region preconditions
    // setup listeners for interacting
    setupListeners() {
        const me = this;
        const myC = me.refs.myCanvas;
        myC.addEventListener('mousedown', me.setPosition);    // starts `recording`
        myC.addEventListener('mousemove', me.draw);           // updates `recording feed`
        myC.addEventListener('mouseup', me.endDrawing)
    }

    // promisified this to optimize reflows
    setupImage() {
        const me = this;
        return new Promise(function (resolve, reject) {
            const ctx = me.getContext();
            ctx.clearRect(0, 0, me.refs.myCanvas.width, me.refs.myCanvas.height);   // redraws
            const imgSrc = me.state.imgSrc;
            const img = new Image();
            img.src = imgSrc;
            img.onload = function() {
                const myC = me.refs.myCanvas;
                myC.setAttribute('width', img.naturalWidth);
                myC.setAttribute('height', img.naturalHeight);
                ctx.drawImage(
                    img,
                    0,
                    0
                );
                resolve();
            }
        });
    }
    //#endregion

    //#region drawing

    //  plots drawing by event or from recorded dot positions, args:
    //  e - event
    //  fromRecord - the user isn't drawing with mouse, we are recreating a previously 'recorded' path
    //  recordedPos - a position from a 'recorded' path's positions array
    draw(e, fromRecord, recordedPos) {
        if (!isDrawing && !fromRecord) {
            return;
        }
        const me = this;
        const ctx = me.getContext();

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        if(!fromRecord) me.setPosition(e);
        let [x, y] = [pos.x, pos.y];
        if(recordedPos) {
            [x, y] = [recordedPos.x, recordedPos.y];
        }
        ctx.lineTo(x, y);

        ctx.stroke();
    }

    setPosition(e) {
        const me = this;
        const coo = {x: e.offsetX, y: e.offsetY}; // coordinate on canvas

        if (!isDrawing) {   // this means we start drawing now, cleanup, init min/max and begin
            me.cleanupValues();
            [minX, minY] = [coo.x, coo.y];
            const ctx = me.getContext();
            ctx.beginPath(); // begin
        }
        isDrawing = true;

        // record min/max values for approximate 'bounds' box size.
        if (coo.y > maxY) maxY = coo.y;
        if (coo.x > maxX) maxX = coo.x;
        if (coo.y < minY) minY = coo.y;
        if (coo.x < minX) minX = coo.x;
        positions.push(coo);    // record movements to keep track of drawn figure
        pos = coo;
    }

    endDrawing(e, fromRecord) {
        const me = this;
        const ctx = me.getContext();

        // this checks for 'dot' - just a click, not a real figure.
        // reflows on true
        if(e && !fromRecord) {  // 2nd condition unnecessary, left for better readability.
            //console.log(positions.length); //debug
            if(positions.length < minPositionsToDraw) {
                me.setState({...me.state}, me.restartAndReplot);
                return;
            };
        }

        ctx.closePath();
        ctx.stroke(); // draw
        ctx.fillStyle = grayFillHex;
        ctx.fill();

        if (!fromRecord && isDrawing) me.popClipped(e);
        isDrawing = false;
    }

    // crates a cutout `piece`
    popClipped(e) {
        const me = this;
        const uniqueId = 'uid' + Date.now();
        const piece = <PieceCanvas
            positions={positions}
            minX={minX}
            minY={minY}
            maxX={maxX}
            maxY={maxY}
            startPos={{x: e.clientX, y: e.clientY}}
            imgSrc={me.props.src}
            key={uniqueId}
            uid={uniqueId}
            onRemove={me.onPieceRemove}
        />;

        me.setState({
            pieces: [...me.state.pieces, piece]
        })
    }

    cleanupValues() {
        [minX, minY, maxX, maxY, positions] = [null, null, 0, 0, []];
    }
    //#endregion

    render() {
        const me = this;
        return (
            <div>
                <section id='canvasWrapper'>
                    <canvas ref={canvasRef}></canvas>
                </section>
                {me.state.pieces}
            </div>
        )
    }
}

export default MainCanvas;