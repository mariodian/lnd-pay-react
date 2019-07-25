import React from 'react';
import '../../helpers/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import kjua from 'kjua';
import './QrCode.css';

class QrCode extends React.Component {
    render() {
        let qr;
        const size = 300;
        const sizeStyle = {
            width: size,
            height: size
        };

        if (this.props.text) {
            qr = kjua({
                back: 'rgb(250, 250, 250)', 
                rounded: 100, 
                size: size, 
                quiet: 1, 
                text: this.props.text,
            });
        }

        return (
            <div className={this.props.className}>
                {
                    this.props.paid && 
                    <div className="qr-overlay text-white"> 
                        <div className="qr-overlay-wrapper">
                            <p>
                                <FontAwesomeIcon icon={['far', 'check-circle']} size="8x" fixedWidth className="text-warning" />
                            </p>
                            <p>Thank you for your payment!</p>
                        </div>
                    </div>
                }
                {
                    this.props.text &&
                    <img crossOrigin="anonymous" src={qr.src} alt={this.props.text} width={size} height={size} style={sizeStyle} />
                }
            </div>
        );
    }
}

export default QrCode