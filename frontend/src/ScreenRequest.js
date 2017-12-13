import React from 'react';
import * as Ant from 'antd';
import moment from 'moment';
const BigNumber = require('bignumber.js');
import escape from 'escape-html';

import ScreenBase from './ScreenBase';
const cnUtils = require('../../contract/scripts/cnUtils.js');


export default class ScreenCertificate extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.fetchInvoice();
    this.fetchInvoiceInterval = setInterval(() => this.fetchInvoice(), 5000);
  }

  componentWillUnmount() {
    this.stopFetchInterval();
  }

  stopFetchInterval() {
    if (this.fetchInvoiceInterval) {
      clearInterval(this.fetchInvoiceInterval);
      delete this.fetchInvoiceInterval;
    }
  }

  fetchInvoice() {
    fetch('http://localhost:3001/api/invoice-status', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ invoiceSecret: this.props.match.params.invoiceSecret, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ invoice: json, }, () => this.invoiceReady());
    });
  }

  invoiceReady() {
    if (window.web3) {
      this.setState({ web3Available: true, });

      this.web3 = new Web3();
      this.web3.setProvider(window.web3.currentProvider);

      let { CertNinjaContract, } = cnUtils.loadCertNinjaContract(this.web3);
      this.certNinjaInstance = CertNinjaContract.at(this.state.invoice.contractAddr);

      this.web3.version.getNetwork((err, networkId) => {
        this.setState({ networkId, });
        this.web3.eth.getAccounts((err, accounts) => {
          this.setState({ accounts, });
        });
      });

      if (!this.state.paymentTx) {
        let tx = localStorage.getItem(`cert-ninja|invoice-tx|${this.state.invoice.invoiceId}`);
        if (tx) this.setState({ paymentTx: tx, });
      }

      if (this.state.invoice.certHash) this.stopFetchInterval();
    } else {
      this.setState({ web3Available: false, });
    }
  }

  myRender() {
    if (!this.state.invoice || this.state.web3Available === undefined) return <div>Loading...</div>;

    if (this.state.invoice.certHash) {
      return (
        <div className="cert-has-been-issued">
          <h1>Your certificate has been issued!</h1>

          <div>
            Thank you for purchasing a certificate. We have emailed the following links to {this.state.invoice.request.email}:
          </div>

          <div>
            <a href={`/address/${this.state.invoice.request.ethAddr}`}>Link for your Ethereum Address</a>
          </div>

          <div>
            <a href={`/certificate/${this.state.invoice.certHash}`}>Direct link to this certificate</a>
          </div>
        </div>
      );
    }


    let paymentInfo;

    if (!this.state.invoice.paid) {
      if (!this.state.web3Available) {
        paymentInfo = <div>No web3 found, please install MetaMask</div>;
      } else if (this.state.networkId === undefined || this.state.accounts === undefined) {
        paymentInfo = <div>Loading web3 status...</div>;
      } else if (parseInt(this.state.networkId) !== 17) { // FIXME: ropsten is 3
        paymentInfo = <div>Incorrect ethereum network {this.state.networkId}. Please change to ropsten and then reload.</div>;
      } else if (this.state.accounts.length === 0) {
        paymentInfo = <div>Please unlock metamask.</div>;
      } else if (cnUtils.normalizeAddr(this.state.accounts[0]) !== cnUtils.normalizeAddr(this.state.invoice.request.ethAddr)) {
        paymentInfo = <div>Unrecognized ethereum address. Please change to {this.state.invoice.request.ethAddr}</div>;
      } else {
        paymentInfo = <Ant.Button type="primary" onClick={this.payInvoice.bind(this)}>Pay {weiToEth(new BigNumber(this.state.invoice.amount)).toFixed(6)} ETH Now</Ant.Button>;
      }
    }

    let rows = [];

    let addRow = (c1, c2, c3) => rows.push(
      <Ant.Row key={c1} type="flex" className="validation-row">
        <Ant.Col span={4}>
          {c1}
        </Ant.Col>

        <Ant.Col span={4}>
          {c2}
        </Ant.Col>

        <Ant.Col span={16}>
          {c3}
        </Ant.Col>
      </Ant.Row>
    );

    addRow(
      'Email Validated',
      this.state.invoice.validated.email ? <Ant.Tag color="green">Validated</Ant.Tag> : <Ant.Tag color="red">Not validated</Ant.Tag>,
      <span>You clicked the link in our email, proving you have access to the address <b>{this.state.invoice.request.email}</b></span>
    );

    addRow(
      'Payment Status',
      this.state.invoice.paid ? <Ant.Tag color="green">Paid</Ant.Tag> : <Ant.Tag color="red">Unpaid</Ant.Tag>,
      (<div>
        <div>{paymentInfo}</div>
        { this.state.paymentError && <div style={{ color: 'red', }}>{this.state.paymentError}</div> }
        { this.state.paymentTx && <div style={{ color: 'green', }}>Payment transaction created: {this.state.paymentTx}</div> }
      </div>),
    );

    addRow(
      'Ethereum Address',
      this.state.invoice.validated.ethAddr ? <Ant.Tag color="green">Validated</Ant.Tag> : <Ant.Tag color="red">Not validated</Ant.Tag>,
      this.state.invoice.validated.ethAddr ? <span>You paid our invoice from the address <b>{this.state.invoice.request.ethAddr}</b> which proves you control it</span> : <span>Please pay our invoice from the address <b>{this.state.invoice.request.ethAddr}</b></span>,
    );

    if (this.state.invoice.request.domain) {
      let url = `https://${escape(this.state.invoice.request.domain)}/.well-known/cert-ninja.txt`;

      let domainInfo = (
        <div>
          <div>
            Create the file <span style={{ fontFamily: 'monospace', }}>/.well-known/cert-ninja.txt</span> and paste in the following text:
          </div>

          <div style={{ margin: 15, }}>
            <pre>{this.state.invoice.domainKey}</pre>
          </div>

          <div style={{ marginBottom: 15, }}>
            We will download the following URL: <a href={url}>{url}</a>
          </div>

          <div>
            <Ant.Button type="primary" onClick={this.validateDomain.bind(this)}>Validate URL</Ant.Button>
          </div>

          {this.state.domainError && <div style={{ color: 'red', }}>{this.state.domainError}</div>}
        </div>
      );

      if (!this.state.invoice.paid) domainInfo = 'Pay invoice first';
      if (this.state.invoice.validated.domain) domainInfo = null;

      addRow(
        'Domain Name',
        this.state.invoice.validated.domain ? <Ant.Tag color="green">Validated</Ant.Tag> : <Ant.Tag color="red">Not validated</Ant.Tag>,
        domainInfo,
      );
    }



    let readyToCreateCert = true;
    if (!this.state.invoice.validated.email || !this.state.invoice.paid) readyToCreateCert = false;
    for (let m of Object.keys(this.state.invoice.request)) {
      if (!this.state.invoice.validated[m]) readyToCreateCert = false;
    }


    return (
      <div className="validation-screen">
        <h1>Request {this.state.invoice.invoiceId.substr(0,10)}... Status</h1>

        {rows}

        <div>
          <Ant.Button type="primary" disabled={!readyToCreateCert} onClick={this.createCert.bind(this)}>Create My Certificate</Ant.Button>
          { this.state.issueCertError && <div style={{ color: 'red', }}>{this.state.issueCertError}</div> }
        </div>
      </div>
    );
  }


  payInvoice() {
    let args = [
      "0x"+cnUtils.normalizeComponent(this.state.invoice.invoiceId, 256),
      "0x"+cnUtils.normalizeComponent(new BigNumber(this.state.invoice.amount), 256),
      "0x"+cnUtils.normalizeComponent(new BigNumber(this.state.invoice.payBy), 64),
      "0x"+cnUtils.normalizeComponent(this.state.invoice.sig.v, 8),
      "0x"+cnUtils.normalizeComponent(this.state.invoice.sig.r, 256),
      "0x"+cnUtils.normalizeComponent(this.state.invoice.sig.s, 256),
    ];

    let opts = {
      value: "0x"+cnUtils.normalizeComponent(new BigNumber(this.state.invoice.amount), 256),
    };

    cnUtils.sendTX(web3, this.certNinjaInstance, 'payInvoice', this.state.accounts[0], null, '0x'+this.state.invoice.contractAddr, args, opts, false, (err, tx) => {
      if (err) {
        console.warn(err);
        this.setState({ paymentError: ""+err, });
        return;
      }

      localStorage.setItem(`cert-ninja|invoice-tx|${this.state.invoice.invoiceId}`, tx);
      this.setState({ paymentTx: ""+tx, });
    });
  }


  validateDomain() {
    fetch('http://localhost:3001/api/validate-domain', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ invoiceSecret: this.props.match.params.invoiceSecret, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      if (json.status === 'OK') {
        this.fetchInvoice();
      } else {
        this.setState({ domainError: json.error, });
      }
    });
  }


  createCert() {
    fetch('http://localhost:3001/api/issue-certificate', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ invoiceSecret: this.props.match.params.invoiceSecret, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      if (json.status === 'OK') {
        this.fetchInvoice();
      } else {
        this.setState({ issueCertError: json.error, });
      }
    });
  }
}


function weiToEth(wei) {
  return wei.floor().div(new BigNumber("1000000000000000000"));
}
