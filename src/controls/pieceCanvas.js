import React, {Component} from 'react';
import './pieceCanvas.css';

// main refs
const containerRef = 'containerRef';
const canvasRef = 'canvasPiece';

// constants
const baseCls = 'x-canvas-piece';
const closeCls = 'fas fa-times-circle fa-2x';
const dragCls = 'x-dragging';

// value to move piece v/h to show it is cut out
const moveBy = 5;

const endTransitionTime = 0.1;

//  on this class overall: i know react's reflow principle.
//  But i think its not best for dragging, so
//  i didnt use setstate and reflows here.
class PieceCanvas extends Component {

    // drag flag. dont want reflows on this one, so not a state property.
    // obvious-IMPORTANT - MUST be instance property.
    _isDragging = false;

    constructor(props) {
        super();
        const me = this;
        me.state = {
            coordinates: {},
            currentPos: {x: null, y: null},     // saves current position for main canvas redraws
        }

        me.drag         = me.drag.bind(me);
        me.close        = me.close.bind(me);
        me.dragStart    = me.dragStart.bind(me);
        me.dragEnd      = me.dragEnd.bind(me);
    }

    componentDidMount() {
        const me = this;
        const container = me.refs[containerRef];
        container.addEventListener('click',     me.close);
        container.addEventListener('mouseup',   me.dragEnd);
        container.addEventListener('mousedown', me.dragStart);
        container.addEventListener('mousemove', me.drag);
        me.makePiece();
    }

    close(e) {
        //console.log('close')
        const me = this;
        if (closeCls === e.target.className) {
            e.stopPropagation();
            me._isDragging = false;
            const myId = me.props.uid;
            const startCoo = {
                x: me.props.startPos.x - me.getWidth() + moveBy,    // calculate start position
                y: me.props.startPos.y - me.getHeight() + moveBy
            };
            me.refs[containerRef].style = 'transition: '+endTransitionTime+'s; left: '+startCoo.x+'px; top: '+startCoo.y+'px';
            setTimeout(()=>me.props.onRemove(myId), endTransitionTime*1000);
        }
    }

    //#region drag
    drag(e) {
        //console.log('drag')
        e.stopPropagation();
        const me = this;
        if(e.buttons === 1 && me._isDragging) {
            const [width, height] = [me.getWidth(), me.getHeight()];  // basic vars
            const el = me.refs[containerRef];
            me.state.currentPos = {x: (e.clientX-width/2)+'px', y: (e.clientY-height/2)+'px'};
            el.style.left       = me.state.currentPos.x;
            el.style.top        = me.state.currentPos.y;
        }
    }

    // below methods are part of mechanism to prevent
    // `drag overlapping` when dragging piece over piece.
    dragStart(e) {
        e.stopPropagation();
        const me = this;
        const container = me.refs[containerRef];
        container.className = [baseCls,dragCls].join(' ');
        me._isDragging = true;
        //console.log('dragstart')
    }

    dragEnd(e) {
        //console.log('dragend')
        e.stopPropagation();
        const me = this;
        const container = me.refs[containerRef];
        container.className = baseCls;
        me._isDragging = false;
    }
    //#endregion

    getWidth() {
        const me = this;
        return me.props.maxX - me.props.minX;
    }

    getHeight() {
        const me = this;
        return me.props.maxY - me.props.minY;
    }

    getCoordinates() {
        const me = this;
        // check for current position on main canvas redraws
        const posX = me.state.currentPos.x || moveBy + me.props.startPos.x;
        const posY = me.state.currentPos.y || moveBy + me.props.startPos.y;
        return {left: posX, top: posY};
    }

    makePiece() {
        const me = this;
        let [maxX, maxY, minX, minY, positions, imgSrc] = [me.props.maxX, me.props.maxY, me.props.minX, me.props.minY, me.props.positions, me.props.imgSrc];
        let node = me.refs[canvasRef];
        //node.style = 'border: 1px solid red;';        //debug
        node.width = maxX - minX;
        node.height = maxY - minY;
        const ctx = node.getContext('2d');
        const img = new Image();
        img.src = imgSrc;
        ctx.beginPath();
        positions.forEach(p => {
            ctx.lineTo(p.x - minX, p.y - minY);
        });
        ctx.closePath();
        ctx.clip();
        //ctx.restore();
        img.onload = function () {
            ctx.drawImage(img, minX, minY, node.width, node.height, 0, 0, node.width, node.height);
        }
    }

    render() {
        const me = this;
        const coordinates = me.getCoordinates();
        return (
            <figure ref={containerRef} style={{...coordinates}} className={baseCls}>
                <canvas ref={canvasRef}></canvas>
                <i className={closeCls}></i>
            </figure>
        );
    }
}

export default PieceCanvas;