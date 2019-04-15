import React, {Component} from 'react';
import './btn.css';

// constants
const baseCls = 'x-btn';

class Btn extends Component {

    constructor(props) {
        super(props);
        const me = this;
        me.onClick = me.onClick.bind(me);
    }

    onClick(e) {
        e.preventDefault();
        const me = this;
        // runs external handler if there is any
        const handler = me.props.onClick;
        if (handler) {
            handler();
        }
    }

    render() {
        const me = this;
        const cls = me.props.cls + ' ' + baseCls;
        return <a onClick={me.onClick} href='/#' className={cls}>{me.props.children}</a>;
    }
}

export default Btn;