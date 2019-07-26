import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../helpers/fontawesome';
import '../../helpers/date';
import Config from '../../Config';
import QrCode from '../QrCode';


import 'bootstrap/dist/css/bootstrap.css';

window.WebSocket = window.WebSocket || window.MozWebSocket;

class LndPay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: this.props.amount && !isNaN(this.props.amount) ? this.props.amount : '',
            description: this.props.description || '',
            payReq: '',
            copied: false,
            paid: false,
            showQR: !!localStorage.showQR
        };
        this.amount =  React.createRef();
        this.payReqRef = React.createRef();
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

        // Amount has non-zero value so remove is-invalid class
        if (name === 'amount') {
            const amount = this.amount.current;

            if (amount.className.indexOf('is-invalid') !== -1) {
            amount.classList.remove('is-invalid');
            }
        }
    }

    handleCopy() {
        this.setState({ copied: true });
        this.payReqRef.current.select();
    }

    isCopied() {
        if (this.state.copied) {
            setTimeout(() => {
            this.setState({ copied: false })
            }, 1000);

            return ' Copied';
        }

        return '';
    }

    toggleQrCode() {
        this.setState({
            showQR: !this.state.showQR
        });
        
        return localStorage.showQR = !localStorage.showQR ? true : '';
    }

    pay() {
        const amount = this.amount.current;

        if (this.state.amount === '' || isNaN(this.state.amount)) {
            amount.classList.add('is-invalid');
            amount.focus();

            return;
        }

        this.payReqRef.current.placeholder = 'Please wait...';

        (async () => {
            const response = await fetch(`${Config.apiUrl}/invoices`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tokens: parseInt(this.state.amount),
                    description: this.state.description,
                    expires_at: new Date().addMinutes(Config.invoiceExpire).toISOString()
                })
            });
            const content = await response.json();
            const paymentRequest = content.request;

            this.setState({
                payReq: paymentRequest
            });

            this.openWebSocket(content.id);
        })();
    }

    openWebSocket(invoiceId) {
        let con = new WebSocket(Config.wsUrl);

        con.onopen = () => {
            // Send invoice ID to server so it only checks for particular invoice status
            if (invoiceId) {
                con.send(invoiceId)
            } else {
                con.close();
            }
        };

        con.onerror = (error) => {
            // an error occurred when sending/receiving data
        };

        con.onmessage = (message) => {
            let json;
            try {
                json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }

            // Invoice paid
            if (json.is_confirmed) {
                this.setState({
                    paid: true
                });
            } else {
                // Invoice not paid
            }
        };
    }

    render() {
        let qrCode;
        const amount = typeof this.props.amount !== 'undefined' && !isNaN(this.props.amount) ? this.props.amount : null;
        const description = typeof this.props.description !== 'undefined' ? this.props.description : null;
        const descriptionVisible = typeof this.props.descriptionHidden === 'undefined';

        if (this.state.showQR) {
            qrCode = <QrCode text={this.state.payReq} paid={this.state.paid} className="qr-wrapper text-center" />
        }

        return (
            <div className="App p-5">
                <div className="input-group mb-2">
                { amount === null && 
                <input 
                    type="text" 
                    name="amount"
                    value={this.state.amount}
                    className="form-control form-control-sm" 
                    placeholder="Enter amount in sats" 
                    onChange={this.handleChange.bind(this)}
                    ref={this.amount}
                />
                }

                { descriptionVisible && 
                <input 
                    type="text" 
                    name="description"
                    readOnly={description !== null}
                    value={this.state.description}
                    className="form-control form-control-sm"
                    placeholder="Enter payment's description" 
                    onChange={this.handleChange.bind(this)}
                />
                }
                </div>

                <div className="input-group input-group-sm mb-3">
                { amount && 
                <div className="input-group-prepend">
                    <span className="input-group-text bg-secondary text-white border-left-0 border-top-0 border-bottom-0">
                        <FontAwesomeIcon icon={['fab', 'bitcoin']} /> &nbsp; {this.props.amount} sat
                    </span>
                </div>
                }

                <input 
                    type="text" 
                    name="payReq"
                    value={this.state.payReq} 
                    readOnly
                    className={"form-control form-control-sm" + (amount !== null && " border-left-0")}
                    placeholder="Payment request" 
                    onChange={this.handleChange.bind(this)} 
                    ref={this.payReqRef} 
                />

                <div className="input-group-append">
                    <CopyToClipboard text={this.state.payReq} onCopy={() => {this.handleCopy()}}>
                    <button className="btn btn-secondary btn-sm">
                        <FontAwesomeIcon icon={'copy'} />
                        {this.isCopied()}
                    </button>
                    </CopyToClipboard>

                    <button id="show_qr" className="btn btn-secondary btn-sm" onClick={() => {this.toggleQrCode()}}>
                        <FontAwesomeIcon icon={'qrcode'} />
                    </button>

                    <button className="btn btn-warning btn-sm" onClick={() => {this.pay()}}>
                        <FontAwesomeIcon icon={'bolt'} /> Pay
                    </button>
                </div>
                </div>

                {qrCode}

            </div>
        );
    }
}

export default LndPay
