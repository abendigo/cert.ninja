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

    fetch('http://localhost:3001/api/invoice-status', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ invoiceSecret: props.match.params.invoiceSecret, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      console.log("YEY",json);
      this.setState({ invoice: json, }, () => this.invoiceReady());
    });
  }

  invoiceReady() {
    if (window.web3) {
      this.setState({ web3Available: true, });

      this.web3 = new Web3();
      this.web3.setProvider(window.web3.currentProvider);

      let { CertNinjaContract, } = cnUtils.loadCertNinjaContract(this.web3);
      let certNinjaInstance = CertNinjaContract.at(this.state.invoice.contractAddr);

      this.web3.version.getNetwork((err, networkId) => {
        this.setState({ networkId, });
        this.web3.eth.getAccounts((err, accounts) => {
          this.setState({ accounts, });
        });
      });
    } else {
      this.setState({ web3Available: false, });
    }
  }

  myRender() {
    if (!this.state.invoice || this.state.web3Available === undefined) return <div>Loading...</div>;

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
        paymentInfo = <Ant.Button>Pay {weiToEth(new BigNumber(this.state.invoice.amount)).toFixed(6)} ETH Now</Ant.Button>;
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
      '',
    );

    addRow(
      'Payment Status',
      this.state.invoice.paid ? <Ant.Tag color="green">Paid</Ant.Tag> : <Ant.Tag color="red">Unpaid</Ant.Tag>,
      paymentInfo,
    );

    addRow(
      'Ethereum Address',
      this.state.invoice.paid ? <Ant.Tag color="green">Validated</Ant.Tag> : <Ant.Tag color="red">Not validated</Ant.Tag>,
      !this.state.invoice.paid && "Pay the invoice to validate your address.",
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
            <Ant.Button>Validate URL</Ant.Button>
          </div>
        </div>
      );

      if (!this.state.invoice.paid) domainInfo = 'Pay invoice first';

      addRow(
        'Domain Name',
        this.state.invoice.validated.domain ? <Ant.Tag color="green">Validated</Ant.Tag> : <Ant.Tag color="red">Not validated</Ant.Tag>,
        domainInfo,
      );
    }

    return (
      <div className="validation-screen">
        <h1>Request {this.state.invoice.invoiceId.substr(0,10)}... Status</h1>

        {rows}
      </div>
    );
  }
}


function weiToEth(wei) {
  return wei.floor().div(new BigNumber("1000000000000000000"));
}
