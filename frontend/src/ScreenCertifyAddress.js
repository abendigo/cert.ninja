import React from 'react';
import * as Ant from 'antd';

import ScreenBase from './ScreenBase';
import * as FrontendUtils from './FrontendUtils';

 

export default class ScreenCertifyAddress extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {
    };

    fetch(`${FrontendUtils.getApiBaseUrl()}/api/get-rates`, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    }).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ pricing: json, });
    });
  }

  myRender() {
    if (!this.state.pricing) return <div>Loading...</div>;

    if (this.state.invoiceCreated) return (
      <Ant.Card title="Success">
        <div>
          Your request has been received, and the certification process has begun. Please check your email for further instructions.
        </div>
      </Ant.Card>
    );

    let fields = [
      {
        name: 'ethAddr',
        namePretty: 'Ethereum Address',
        desc: <div><div>The Ethereum address you wish to certify.</div><div style={{ marginTop: 5, }}><Ant.Tag color="red">IMPORTANT NOTE</Ant.Tag>: We are currently in a beta testing period so please enter a <b>ropsten testnet address</b>.</div></div>,
        placeholder: 'ropsten testnet ethereum address',
        type: 'input',
        required: true,
      },
      {
        name: 'email',
        namePretty: 'Email Address',
        desc: <div>We will send you an email with a URL that you must click.</div>,
        placeholder: 'email address',
        type: 'input',
        required: true,
        time: '5 minutes',
      },
      {
        name: 'domain',
        namePretty: 'Domain Name',
        desc: <div>We will provide a file that you must put on an https URL on the provided domain.</div>,
        placeholder: 'domain name',
        type: 'input',
        time: '5 minutes',
      },
      {
        name: 'sms',
        namePretty: 'SMS (Text Message)',
        desc: <div>We will send an SMS to a phone number containing a short code that you must enter on our site.</div>,
        placeholder: 'phone number (cell-phone only)',
        type: 'input',
        time: '10 minutes',
        comingSoon: true,
      },
      {
        name: 'phone',
        namePretty: 'Phone Call',
        desc: <div>We will call your number and read out a short code that you must enter on our site.</div>,
        placeholder: 'phone number',
        type: 'input',
        time: '1 hour',
        comingSoon: true,
      },
      {
        name: 'snailmail',
        namePretty: 'Mailing Address',
        desc: <div>We will send a letter via post to this address containing a short code that you must enter on our site.</div>,
        placeholder: 'mailing address',
        type: 'mailing',
        time: '2 weeks',
        comingSoon: true,
      }
    ];

    let centsToDollars = (c) => (c / 100).toFixed(2);
    let centsToEth = (c) => (c / this.state.pricing.ethUsd).toFixed(6);

    let billingCols = [
      {
        title: "Item",
        key: "item",
        render: (e) => e.item,
      },
      {
        title: "Cost (USD)",
        key: "cost_usd",
        render: (e) => {
          let costCents = this.state.pricing.pricing[e.name] || 0;
          return "$" + centsToDollars(costCents);
        },
      },
      {
        title: "Cost (ETH)",
        key: "cost_eth",
        render: (e) => {
          let costCents = this.state.pricing.pricing[e.name] || 0;
          return "" + centsToEth(costCents);
        },
      }
    ];

    let totalCents = 0;

    let billingData = [{ item: 'Base Cost', name: 'base', }];

    let formOk = true;

    for (let f of fields) {
      if (f.required || this.state[f.name + '_enabled']) {
        billingData.push({ item: f.namePretty, name: f.name, });
        let data = this.state[f.name + '_data'];
        if (data === undefined) formOk = false;
      }
    }

    totalCents = billingData.map(f => this.state.pricing.pricing[f.name] || 0).reduce((a,b) => a+b, 0);

    return (
      <div className="certify-address">
        <h1>Certify Address</h1>

        {fields.map(f => {
         let cost;
         let costCents = this.state.pricing.pricing[f.name];
         if (!costCents) cost = <span>Included.</span>;
         else cost = <span>USD${centsToDollars(costCents)} ({centsToEth(costCents)} ETH)</span>

         return (
          <Ant.Card key={f.name} title={f.namePretty} style={{ marginTop: 15, }}>
            <Ant.Row type="flex">
              <Ant.Col span={6}>
                {f.desc}
              </Ant.Col>

              <Ant.Col span={8} style={{ marginLeft: 40, marginRight: 40, }}>
                <div style={{ marginBottom: 20, }}>
                  {f.required ?
                     <Ant.Tag color="cyan">Required</Ant.Tag> :
                     <Ant.Switch disabled={f.comingSoon} onChange={(s) => this.setState({ [f.name + '_enabled']: s, })} />
                  }
                  {f.comingSoon && <Ant.Tag style={{ marginLeft: 20, }} color="orange">Coming soon...</Ant.Tag>}
                </div>

                <Ant.Input placeholder={f.placeholder} disabled={!f.required && !this.state[f.name + '_enabled']}
                           onChange={(v) => this.setState({ [f.name + '_data']: v.target.value, })} />
              </Ant.Col>

              <Ant.Col span={4}>
                <div>Cost: {cost}</div>

                {f.time !== undefined && <div>
                  Time: Approximately {f.time}
                </div>}
              </Ant.Col>
            </Ant.Row>
          </Ant.Card>
         );
        })}

        <Ant.Card style={{ marginTop: 40, marginBottom: 40, }} title="Billing summary">
          <Ant.Table rowKey="item" columns={billingCols} dataSource={billingData} pagination={false}
                     footer={() => <span style={{ fontWeight: 'bold', fontSize: '140%', }}>Total: {centsToEth(totalCents)} ETH</span>} />
        </Ant.Card>

        <Ant.Button type="primary" disabled={this.state.submitting || !formOk} onClick={() => this.onSubmit(billingData)}>Certify Address</Ant.Button>
      </div> 
    );
  }

  onSubmit(billingData) {
    let request = {};

    for(let f of billingData) {
      if (f.name === 'base') continue;
      request[f.name] = this.state[f.name + '_data'];
    }

    this.setState({ submitting: true, });

    fetch(`${FrontendUtils.getApiBaseUrl()}/api/create-invoice`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ invoiceCreated: true, });
    });
  }
}
